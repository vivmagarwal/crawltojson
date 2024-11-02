const inquirer = require("inquirer");
const { writeFileSync } = require("fs");
const chalk = require("chalk");

const defaultConfig = {
  url: "",
  match: "",
  selector: "",
  maxPages: 50,
  outputFile: "crawltojson.output.json",
  maxRetries: 3,
  maxLevels: 3,
  timeout: 7000,
  excludePatterns: [
    "**/tag/**", // Ignore tag pages
    "**/tags/**", // Ignore tags pages
    "**/#*", // Ignore anchor links
    "**/search**", // Ignore search pages
    "**.mp4", // Ignore mp4 files
    "**/archive/**", // Ignore archive pages
  ],
  ignoreSelectors: [
    ".hs-cookie-notification-position-bottom", // Cookie notifications
    ".cookie-banner", // Cookie banners
    ".popup-overlay", // Popups
    ".newsletter-signup", // Newsletter popups
    ".chat-widget", // Chat widgets
    ".advertisement", // Ads
    "#hubspot-messages-iframe-container", // HubSpot chat
    ".intercom-lightweight-app", // Intercom chat
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
      type: "input",
      name: "ignoreSelectors",
      message: "Additional selectors to ignore (comma-separated)",
      default: "",
      filter: (input) =>
        input
          ? defaultConfig.ignoreSelectors.concat(
              input
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            )
          : defaultConfig.ignoreSelectors,
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
