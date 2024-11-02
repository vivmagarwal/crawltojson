#!/usr/bin/env node
import { Command } from "commander";
import { generateConfig } from "./config.js";
import { crawlWebsite } from "./crawler.js";
import { readFileSync } from "fs";
import chalk from "chalk";

const program = new Command();

program.name("crawltojson").description("Crawl websites and convert them to JSON with ease").version("1.0.0");

program.command("config").description("Generate a configuration file").action(generateConfig);

program
  .command("crawl")
  .description("Crawl website based on config file")
  .action(async () => {
    try {
      const configFile = readFileSync("./crawltojson.config.json", "utf8");
      const config = JSON.parse(configFile);
      await crawlWebsite(config);
    } catch (error) {
      console.error(chalk.red('Error: Could not read config file. Run "crawltojson config" first.'));
      process.exit(1);
    }
  });

program.parse();
