
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
        if (visitedUrls.has(url) || pagesVisited >= 20) {
          return callback();
        }

        // Random delay before visiting next page
        delay(getRandomDelay())
          .then(() => page.goto(url))
          .then(() => {
            visitedUrls.add(url);
            pagesVisited++;
            
            process.send({ type: 'progress', url });
            
            return page.$$eval('.body-container', 
              (elements) => elements.map((el) => el.innerText)
            );
          })
          .then((content) => {
            results.push({
              url,
              content: content.join("\n"),
              timestamp: new Date().toISOString(),
            });
            
            return page.$$eval(
              "a[href]",
              (elements, pattern) => 
                elements
                  .map((el) => el.href)
                  .filter((href) => href.match(pattern)),
              'https://www.axelerant.com/blog/.*'
            );
          })
          .then((links) => {
            let processed = 0;
            
            function processNextLink() {
              if (processed >= links.length || pagesVisited >= 20) {
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
          crawlPage(browser, context, page, 'https://www.axelerant.com/', function() {
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
  