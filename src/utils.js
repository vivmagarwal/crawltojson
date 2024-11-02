// src/utils.js
/**
 * Converts a glob-style pattern (with ** wildcards) to a RegExp for matching URLs.
 * @param {string} pattern - The glob-style pattern to convert.
 * @returns {RegExp} - The generated regular expression.
 */
function patternToRegex(pattern) {
  return new RegExp(pattern.replace(/\*\*/g, ".*").replace(/[.*+?^$()|[\]\\]/g, "\\$&"), "i");
}

/**
 * Normalizes a URL by removing hash and search parameters, and trailing slashes.
 * @param {string} url - The URL to normalize.
 * @returns {string} - The normalized URL.
 */
function normalizeUrl(url) {
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

/**
 * Checks if a URL should be excluded based on the exclude patterns.
 * @param {string} url - The URL to check.
 * @param {string[]} excludePatterns - Array of glob patterns to exclude.
 * @returns {boolean} - True if the URL should be excluded.
 */
function shouldExcludeUrl(url, excludePatterns) {
  return excludePatterns.some((pattern) => {
    const regex = new RegExp(pattern.replace(/\*\*/g, ".*").replace(/[.*+?^$()|[\]\\]/g, "\\$&"), "i");
    return regex.test(url);
  });
}

module.exports = { patternToRegex, normalizeUrl, shouldExcludeUrl };
