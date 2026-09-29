#!/usr/bin/env node
import { Command } from "commander";
import { createProject } from "./create.js";
import { input } from "@inquirer/prompts";

const program = new Command();

program
  .name("create-next-with-query-starter")
  .argument("[project-name]")
  .option("--pm <manager>", "package manager (npm | pnpm | yarn | bun)")
  .action(async (name, opts) => {
    let projectName = name as string | undefined;
    if (!projectName) {
      projectName = await input({
        message: "Project name:",
        validate: (v: string) =>
          (v && v.trim().length > 0) || "Please enter a project name",
      });
    }

    if (!projectName) {
      console.error("No project name provided. Aborting.");
      process.exit(1);
    }

    await createProject(projectName.trim(), opts.pm);
  });

program.parse();
