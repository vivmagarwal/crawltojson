const ora = require("ora");
const chalk = require("chalk");
const { writeFileSync } = require("fs");
const { spawn, execSync } = require("child_process");
const path = require("path");

function getRandomDelay() {
  // Returns random number between 500 and 1500 (milliseconds)
  return Math.floor(Math.random() * (1500 - 500 + 1) + 500);
}

function installBrowser(callback) {
  const spinner = ora("Installing Playwright browser...").start();
  try {
    execSync("npx playwright install chromium", { stdio: "inherit" });
    spinner.succeed("Browser installed successfully");
    callback(null, true);
  } catch (error) {
    spinner.fail("Failed to install browser automatically");
    console.error(chalk.red("\nPlease run this command manually:"));
    console.error(chalk.blue("\n    npx playwright install chromium\n"));
    callback(null, false);
  }
}

function crawlWebsite(config, callback) {
  const spinner = ora("Starting crawler...").start();

  const tempScript = `
    const { chromium } = require('playwright');
    
    function delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    function getRandomDelay() {
      return Math.floor(Math.random() * (1500 - 500 + 1) + 500);
    }
    
    function crawl() {
      const results = [];
      let pagesVisited = 0;
      const visitedUrls = new Set();
      
      function crawlPage(browser, context, page, url, callback) {
        if (visitedUrls.has(url) || pagesVisited >= ${config.maxPages}) {
          return callback();
        }

        // Random delay before visiting next page
        delay(getRandomDelay())
          .then(() => page.goto(url))
          .then(() => {
            visitedUrls.add(url);
            pagesVisited++;
            
            process.send({ type: 'progress', url });
            
            return page.$$eval('${config.selector}', 
              (elements) => elements.map((el) => el.innerText)
            );
          })
          .then((content) => {
            results.push({
              url,
              content: content.join("\\n"),
              timestamp: new Date().toISOString(),
            });
            
            return page.$$eval(
              "a[href]",
              (elements, pattern) => 
                elements
                  .map((el) => el.href)
                  .filter((href) => href.match(pattern)),
              '${config.match.replace("**", ".*")}'
            );
          })
          .then((links) => {
            let processed = 0;
            
            function processNextLink() {
              if (processed >= links.length || pagesVisited >= ${config.maxPages}) {
                return callback();
              }
              
              crawlPage(browser, context, page, links[processed], function() {
                processed++;
                processNextLink();
              });
            }
            
            processNextLink();
          })
          .catch((error) => {
            process.send({ type: 'warning', url, message: error.message });
            callback();
          });
      }
      
      // Launch browser with headless: false to make it visible
      chromium.launch({
        headless: false,
        slowMo: 50 // Add slight slowdown for visibility
      })
        .then(function(browser) {
          return browser.newContext()
            .then(function(context) {
              return context.newPage()
                .then(function(page) {
                  // Set viewport size for better visibility
                  return page.setViewportSize({ width: 1280, height: 800 })
                    .then(() => ({ browser, context, page }));
                });
            });
        })
        .then(function({ browser, context, page }) {
          crawlPage(browser, context, page, '${config.url}', function() {
            // Add small delay before closing to see the last page
            delay(1000)
              .then(() => browser.close())
              .then(() => {
                process.send({ 
                  type: 'complete', 
                  results,
                  pagesVisited 
                });
              });
          });
        })
        .catch(function(error) {
          if (error.message.includes("Executable doesn't exist")) {
            process.send({ type: 'needsInstall' });
          } else {
            process.send({ type: 'error', message: error.message });
          }
        });
    }
    
    crawl();
  `;

  const scriptPath = path.join(process.cwd(), ".temp-crawler-script.js");
  writeFileSync(scriptPath, tempScript);

  let retries = 0;
  const maxRetries = 1;

  function runCrawler(cb) {
    const crawler = spawn("node", [scriptPath], {
      stdio: ["inherit", "inherit", "inherit", "ipc"],
    });

    crawler.on("message", function (message) {
      switch (message.type) {
        case "needsInstall":
          if (retries < maxRetries) {
            retries++;
            spinner.info("Browser not found, attempting to install...");
            installBrowser(function (err, installed) {
              if (installed) {
                spinner.info("Retrying crawler...");
                runCrawler(cb);
              } else {
                cb(new Error("Browser installation required"));
              }
            });
          } else {
            cb(new Error("Browser installation required"));
          }
          break;

        case "progress":
          const delay = getRandomDelay();
          spinner.text = `Crawling ${message.url} (waiting ${delay}ms before next page)`;
          break;

        case "warning":
          spinner.warn(chalk.yellow(`Warning: Error crawling ${message.url}: ${message.message}`));
          break;

        case "complete":
          writeFileSync(config.outputFile, JSON.stringify(message.results, null, 2));
          spinner.succeed(chalk.green(`Crawling complete! Processed ${message.pagesVisited} pages`));
          cb();
          break;

        case "error":
          cb(new Error(message.message));
          break;
      }
    });

    crawler.on("error", function (error) {
      cb(error);
    });

    crawler.on("exit", function (code) {
      if (code !== 0) {
        cb(new Error(`Crawler process exited with code ${code}`));
      }
    });
  }

  runCrawler(function (error) {
    try {
      require("fs").unlinkSync(scriptPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }

    if (error) {
      spinner.fail(chalk.red("Crawling failed:", error.message));
      return process.exit(1);
    }
  });
}

module.exports = { crawlWebsite };
