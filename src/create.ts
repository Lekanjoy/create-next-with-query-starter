import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { execa } from "execa";
import { select } from "@inquirer/prompts";
import ora from "ora";
import pc from "picocolors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const installCmd: Record<PackageManager, string[]> = {
  npm: ["install"],
  pnpm: ["add"],
  yarn: ["add"],
  bun: ["add"],
};

const VALID_PM: PackageManager[] = ["npm", "pnpm", "yarn", "bun"];

export async function createProject(name: string, pmFlag?: string) {
  const destination = path.join(process.cwd(), name);
  const templatesDir = path.join(__dirname, "templates");

  const pkgManager: PackageManager =
    VALID_PM.includes(pmFlag as PackageManager)
      ? (pmFlag as PackageManager)
      : await select<PackageManager>({
          message: "Package manager:",
          choices: [
            { value: "pnpm", name: "pnpm" },
            { value: "npm", name: "npm" },
            { value: "yarn", name: "yarn" },
            { value: "bun", name: "bun" },
          ],
        });

  // Step 1: Scaffold Next.js project
  console.log(pc.bold(`\nScaffolding ${pc.cyan(name)}...\n`));
  await execa(
    "npx",
    [
      "create-next-app@latest",
      name,
      "--typescript",
      "--tailwind",
      "--eslint",
      "--app",
      "--no-src-dir",
      "--import-alias",
      "@/*",
      `--use-${pkgManager}`,
      "--yes",
    ],
    { cwd: process.cwd(), stdio: "inherit" },
  );

  // Step 2: Seed components.json + globals.css + lib/utils before shadcn add
  const spinner = ora("Seeding shadcn config...").start();
  await fs.copy(
    path.join(templatesDir, "components.json"),
    path.join(destination, "components.json"),
    { overwrite: true },
  );
  await fs.copy(
    path.join(templatesDir, "app", "globals.css"),
    path.join(destination, "app", "globals.css"),
    { overwrite: true },
  );
  await fs.ensureDir(path.join(destination, "lib"));
  await fs.copy(
    path.join(templatesDir, "lib", "utils.ts"),
    path.join(destination, "lib", "utils.ts"),
    { overwrite: true },
  );
  spinner.succeed("shadcn config seeded");

  // Step 3: Install shadcn components (resolves peer deps automatically)
  console.log(pc.bold("\nAdding shadcn/ui components...\n"));
  try {
    await execa(
      "npx",
      [
        "shadcn@latest",
        "add",
        "button",
        "form",
        "input",
        "label",
        "select",
        "textarea",
        "separator",
        "sonner",
        "--yes",
        "--overwrite",
      ],
      { cwd: destination, stdio: "inherit" },
    );
  } catch {
    console.warn(
      pc.yellow(
        "\nWarning: shadcn/ui setup had issues. Run `npx shadcn@latest add` manually if needed.\n",
      ),
    );
  }

  // Step 4: Install all extra dependencies (includes shadcn peer deps to avoid
  // shadcn's --yes silently skipping package installs in some environments)
  const extraDeps = [
    // TanStack Query
    "@tanstack/react-query",
    "@tanstack/react-query-devtools",
    // API + forms
    "axios",
    "react-hook-form",
    "@hookform/resolvers",
    "zod",
    // Token storage + toasts
    "idb-keyval",
    "sonner",
    // shadcn peer deps
    "lucide-react",
    "tw-animate-css",
    "tailwind-merge",
    "clsx",
    "class-variance-authority",
    "@radix-ui/react-slot",
    "@radix-ui/react-label",
    "@radix-ui/react-select",
    "@radix-ui/react-separator",
    "next-themes",
  ];
  spinner.start("Installing dependencies...");
  await execa(pkgManager, [...installCmd[pkgManager], ...extraDeps], {
    cwd: destination,
  });
  spinner.succeed("Dependencies installed");

  // Step 5: Copy the complete template after shadcn so its CSS remains the
  // source of truth for the generated starter.
  spinner.start("Adding starter files...");
  await fs.copy(templatesDir, destination, {
    overwrite: true,
  });
  spinner.succeed("Starter files added");

  // Step 6: Bootstrap .env.local
  const envExamplePath = path.join(destination, ".env.example");
  const envLocalPath = path.join(destination, ".env.local");
  if (
    (await fs.pathExists(envExamplePath)) &&
    !(await fs.pathExists(envLocalPath))
  ) {
    await fs.copy(envExamplePath, envLocalPath);
  }

  console.log("\n" + pc.green("✅ Done!"));
  console.log(pc.bold("\nNext steps:"));
  console.log(`  ${pc.cyan(`cd ${name}`)}`);
  console.log(`  ${pc.cyan(`${pkgManager} run dev`)}`);
  console.log(pc.dim("\nUpdate .env.local with your API base URL."));
}
