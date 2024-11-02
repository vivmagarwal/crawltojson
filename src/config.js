import inquirer from "inquirer";
import { writeFileSync } from "fs";
import chalk from "chalk";

const defaultConfig = {
  url: "",
  match: "",
  selector: "",
  maxPages: 50,
  outputFile: "webtojson.output.json",
  excludePatterns: [],
};

export async function generateConfig() {
  console.log(chalk.blue("Creating webtojson configuration file..."));

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "url",
      message: "What is the starting URL to crawl?",
      validate: (input) => input.startsWith("http") || "Please enter a valid URL",
    },
    {
      type: "input",
      name: "match",
      message: "What URL pattern should be matched? (e.g., https://example.com/**)",
      default: (answers) => answers.url + "/**",
    },
    {
      type: "input",
      name: "selector",
      message: "What CSS selector should be used to extract content?",
      default: "body",
    },
    {
      type: "number",
      name: "maxPages",
      message: "Maximum number of pages to crawl?",
      default: 50,
    },
  ]);

  const config = { ...defaultConfig, ...answers };

  try {
    writeFileSync("./webtojson.config.json", JSON.stringify(config, null, 2));
    console.log(chalk.green("Configuration file created successfully!"));
  } catch (error) {
    console.error(chalk.red("Error creating configuration file:", error.message));
    process.exit(1);
  }
}
