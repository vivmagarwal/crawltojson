import { chromium } from "playwright";
import ora from "ora";
import chalk from "chalk";
import { writeFileSync } from "fs";

export async function crawlWebsite(config) {
  const spinner = ora("Starting crawler...").start();
  const results = [];
  let pagesVisited = 0;

  try {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Keep track of visited URLs
    const visitedUrls = new Set();

    async function crawlPage(url) {
      if (visitedUrls.has(url) || pagesVisited >= config.maxPages) {
        return;
      }

      try {
        spinner.text = `Crawling ${url}`;
        await page.goto(url);
        visitedUrls.add(url);
        pagesVisited++;

        // Extract content based on selector
        const content = await page.$$eval(config.selector, (elements) => elements.map((el) => el.innerText));

        // Store result
        results.push({
          url,
          content: content.join("\n"),
          timestamp: new Date().toISOString(),
        });

        // Find links matching the pattern
        const links = await page.$$eval("a[href]", (elements, pattern) => elements.map((el) => el.href).filter((href) => href.match(pattern)), config.match.replace("**", ".*"));

        // Crawl found links
        for (const link of links) {
          if (pagesVisited < config.maxPages) {
            await crawlPage(link);
          }
        }
      } catch (error) {
        console.error(chalk.yellow(`Warning: Error crawling ${url}:`, error.message));
      }
    }

    await crawlPage(config.url);
    await browser.close();

    // Save results
    writeFileSync(config.outputFile, JSON.stringify(results, null, 2));

    spinner.succeed(chalk.green(`Crawling complete! Processed ${pagesVisited} pages`));
  } catch (error) {
    spinner.fail(chalk.red("Crawling failed:", error.message));
    process.exit(1);
  }
}
