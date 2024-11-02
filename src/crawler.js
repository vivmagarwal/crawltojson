// src/crawler.js
const { chromium } = require("playwright");
const chalk = require("chalk");
const { createWriteStream } = require("fs");
const { execSync } = require("child_process");
const { Transform } = require("stream");

class ResultsTransform extends Transform {
  constructor(options = {}) {
    options.objectMode = true;
    super(options);
    this.isFirst = true;
    this.resultsCount = 0;
  }

  _transform(chunk, encoding, callback) {
    try {
      let data = "";

      if (this.isFirst) {
        data = "[\n";
        this.isFirst = false;
      } else {
        data = ",\n";
      }

      data += JSON.stringify(chunk, null, 2);
      this.resultsCount++;

      callback(null, data);
    } catch (error) {
      callback(error);
    }
  }

  _flush(callback) {
    this.push("\n]");
    callback();
  }

  getResultsCount() {
    return this.resultsCount;
  }
}

function installBrowser(callback) {
  console.log(chalk.blue("Installing Playwright browser..."));
  try {
    execSync("npx playwright install chromium", { stdio: "inherit" });
    console.log(chalk.green("Browser installed successfully"));
    callback(null, true);
  } catch (error) {
    console.error(chalk.red("Failed to install browser automatically"));
    console.error(chalk.red("\nPlease run this command manually:"));
    console.error(chalk.blue("\n    npx playwright install chromium\n"));
    callback(null, false);
  }
}

async function crawlWebsite(config) {
  console.log(chalk.blue("\nStarting crawler...\n"));

  const visitedUrls = new Set();
  let pagesVisited = 0;
  const resultsTransform = new ResultsTransform();
  const outputStream = createWriteStream(config.outputFile);
  resultsTransform.pipe(outputStream);

  async function normalizeUrl(url) {
    try {
      const urlObj = new URL(url);
      urlObj.hash = "";
      urlObj.search = "";
      return urlObj.toString().replace(/\/+$/, "");
    } catch (error) {
      console.error("Error normalizing URL:", error);
      return url;
    }
  }

  function shouldExcludeUrl(url, patterns) {
    return patterns.some((pattern) => {
      const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/[.*+?^$()|[\]\\]/g, "\\$&"), "i");
      return regex.test(url);
    });
  }

  async function retryOperation(operation, maxRetries = config.maxRetries) {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          console.log(chalk.yellow(`Retry attempt ${attempt}/${maxRetries}`));
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError;
  }

  async function crawlPage(browser, context, page, url, currentLevel = 0) {
    const normalizedUrl = await normalizeUrl(url);

    if (visitedUrls.has(normalizedUrl) || pagesVisited >= config.maxPages || currentLevel >= config.maxLevels || shouldExcludeUrl(normalizedUrl, config.excludePatterns)) {
      return;
    }

    console.log(chalk.blue(`→ Starting: ${normalizedUrl} (Level: ${currentLevel})`));

    try {
      await retryOperation(async () => {
        await page.goto(url, {
          waitUntil: "networkidle",
          timeout: config.timeout,
        });
      });

      visitedUrls.add(normalizedUrl);
      pagesVisited++;

      const content = await page.$$eval(config.selector, (elements) => elements.map((el) => el.innerText));

      resultsTransform.write({
        url: normalizedUrl,
        content: content.join("\n"),
        timestamp: new Date().toISOString(),
        level: currentLevel,
      });

      console.log(chalk.green(`✓ Saved: ${normalizedUrl}`));

      if (currentLevel < config.maxLevels) {
        const links = await page.$$eval("a[href]", (elements, pattern) => elements.map((el) => el.href).filter((href) => href.match(pattern)), config.match.replace("**", ".*"));

        for (const link of links) {
          if (pagesVisited >= config.maxPages) break;
          await crawlPage(browser, context, page, link, currentLevel + 1);
        }
      }
    } catch (error) {
      console.log(chalk.red(`✗ Error: ${normalizedUrl} - ${error.message}`));
    }
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    await crawlPage(browser, context, page, config.url, 0);
    await browser.close();

    resultsTransform.end();

    await new Promise((resolve) => {
      outputStream.on("finish", () => {
        console.log(chalk.green(`\n✓ Crawling complete! Processed ${pagesVisited} pages`));
        console.log(chalk.blue(`✓ Results saved to ${config.outputFile}\n`));
        resolve();
      });
    });
  } catch (error) {
    if (error.message.includes("Executable doesn't exist")) {
      console.error(chalk.red("\nBrowser installation required"));
      installBrowser((err, installed) => {
        if (installed) {
          console.log(chalk.blue("\nPlease try running the crawler again."));
        }
      });
    } else {
      console.error(chalk.red("\nCrawling failed:", error.message, "\n"));
    }
    process.exit(1);
  }
}

module.exports = { crawlWebsite };
