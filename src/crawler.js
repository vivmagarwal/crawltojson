// Only showing the modified part of the crawler.js file where content extraction happens

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

    // Hide elements that should be ignored before extracting content
    if (config.ignoreSelectors && config.ignoreSelectors.length > 0) {
      await page.evaluate((selectors) => {
        selectors.forEach((selector) => {
          document.querySelectorAll(selector).forEach((element) => {
            element.style.display = "none";
          });
        });
      }, config.ignoreSelectors);
    }

    visitedUrls.add(normalizedUrl);
    pagesVisited++;

    // Modified content extraction to exclude ignored elements
    const content = await page.$$eval(
      config.selector,
      (elements, ignoreSelectors) => {
        // Create a function to check if an element or its parents match ignored selectors
        const shouldIgnore = (element) => {
          let current = element;
          while (current) {
            if (ignoreSelectors.some((selector) => current.matches && current.matches(selector))) {
              return true;
            }
            current = current.parentElement;
          }
          return false;
        };

        return elements.filter((el) => !shouldIgnore(el)).map((el) => el.innerText);
      },
      config.ignoreSelectors || []
    );

    resultsTransform.write({
      url: normalizedUrl,
      content: content.join("\n"),
      timestamp: new Date().toISOString(),
      level: currentLevel,
    });

    console.log(chalk.green(`✓ Saved: ${normalizedUrl}`));

    // Rest of the crawlPage function remains the same...
  } catch (error) {
    console.log(chalk.red(`✗ Error: ${normalizedUrl} - ${error.message}`));
  }
}
