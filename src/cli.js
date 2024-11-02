const { Command } = require("commander");
const { generateConfig } = require("./config.js");
const { crawlWebsite } = require("./crawler.js");
const { readFileSync } = require("fs");
const chalk = require("chalk");

const program = new Command();

program.name("crawltojson").description("Crawl websites and convert them to JSON with ease").version("1.0.4");

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
