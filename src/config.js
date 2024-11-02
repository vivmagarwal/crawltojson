// src/config.js
const inquirer = require("inquirer");
const { writeFileSync } = require("fs");
const chalk = require("chalk");

const defaultConfig = {
  url: "",
  match: "",
  selector: "",
  maxPages: 50,
  maxRetries: 3,
  maxLevels: 3,
  timeout: 7000,
  outputFile: "crawltojson.output.json",
  excludePatterns: [
    "**/tag/**", // Ignore tag pages
    "**/tags/**", // Ignore tags pages
    "**/#*", // Ignore anchor links
    "**/search**", // Ignore search pages
    "**.pdf", // Ignore PDF files
    "**/archive/**", // Ignore archive pages
  ],
};

async function generateConfig() {
  console.log(chalk.blue("Creating crawltojson configuration file..."));

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
      default: (answers) => {
        const baseUrl = answers.url.replace(/\/+$/, "");
        return `${baseUrl}/**`;
      },
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
    {
      type: "number",
      name: "maxRetries",
      message: "Maximum number of retries for failed requests?",
      default: 3,
    },
    {
      type: "number",
      name: "maxLevels",
      message: "Maximum depth level for crawling?",
      default: 3,
    },
    {
      type: "number",
      name: "timeout",
      message: "Page load timeout in milliseconds?",
      default: 7000,
    },
  ]);

  const config = { ...defaultConfig, ...answers };

  try {
    writeFileSync("./crawltojson.config.json", JSON.stringify(config, null, 2));
    console.log(chalk.green("Configuration file created successfully!"));
  } catch (error) {
    console.error(chalk.red("Error creating configuration file:", error.message));
    process.exit(1);
  }
}

module.exports = { generateConfig };
