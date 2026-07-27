#!/usr/bin/env node

import { Command } from "commander";
import { createProject } from "./create.js";

const program = new Command();

program
  .name("create-next-with-query-starter")
  .argument("<project-name>")
  .option("--pm <manager>", "package manager (npm | pnpm | yarn | bun)")
  .action((name, opts) => createProject(name, opts.pm));

program.parse();
