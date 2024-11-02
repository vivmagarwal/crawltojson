# crawltojson

A powerful and flexible web crawler that converts website content into structured JSON. Perfect for creating training datasets, content migration, web scraping, or any task requiring structured web content extraction.

## 🎯 Intended Use 
Just two commands to crawl a website and save the content in a structured JSON file.

```
npx crawltojson config
npx crawltojson crawl
```

## 🚀 Features

- 🌐 Crawl any website with customizable patterns
- 📦 Export to structured JSON
- 🎯 CSS selector-based content extraction
- 🔄 Automatic retry mechanism for failed requests
- 🌲 Depth-limited crawling
- ⏱️ Configurable timeouts
- 🚫 URL pattern exclusion
- 💾 Stream-based processing for memory efficiency
- 🎨 Beautiful CLI interface with progress indicators

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration Options](#configuration-options)
- [Advanced Usage](#advanced-usage)
- [Output Format](#output-format)
- [Use Cases](#use-cases)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 🔧 Installation

### Global Installation (Recommended)
```bash
npm install -g crawltojson
```

### Using npx (No Installation)
```bash
npx crawltojson
```

### Local Project Installation
```bash
npm install crawltojson
```

## 🚀 Quick Start

1. Generate configuration file:
```bash
crawltojson config
```

2. Start crawling:
```bash
crawltojson crawl
```

## ⚙️ Configuration Options

### Basic Options

- `url` - Starting URL to crawl
  - Example: "https://example.com/blog"
  - Must be a valid HTTP/HTTPS URL

- `match` - URL pattern to match (supports glob patterns)
  - Example: "https://example.com/blog/**"
  - Use ** for wildcard matching
  - Default: Same as starting URL with /** appended

- `selector` - CSS selector to extract content
  - Example: "article.content"
  - Default: "body"
  - Supports any valid CSS selector

- `maxPages` - Maximum number of pages to crawl
  - Default: 50
  - Range: 1 to unlimited
  - Helps control crawl scope

### Advanced Options

- `maxRetries` - Maximum number of retries for failed requests
  - Default: 3
  - Useful for handling temporary network issues
  - Exponential backoff between retries

- `maxLevels` - Maximum depth level for crawling
  - Default: 3
  - Controls how deep the crawler goes from the starting URL
  - Level 0 is the starting URL
  - Helps prevent infinite crawling

- `timeout` - Page load timeout in milliseconds
  - Default: 7000 (7 seconds)
  - Prevents hanging on slow-loading pages
  - Adjust based on site performance

- `excludePatterns` - Array of URL patterns to ignore
  - Default patterns:
    ```json
    [
      "**/tag/**",    // Ignore tag pages
      "**/tags/**",   // Ignore tag listings
      "**/#*",        // Ignore anchor links
      "**/search**",  // Ignore search pages
      "**.pdf",       // Ignore PDF files
      "**/archive/**" // Ignore archive pages
    ]
    ```

### Configuration File

The configuration is stored in `crawltojson.config.json`. Example:
```json
{
  "url": "https://example.com/blog",
  "match": "https://example.com/blog/**",
  "selector": "article.content",
  "maxPages": 100,
  "maxRetries": 3,
  "maxLevels": 3,
  "timeout": 7000,
  "outputFile": "crawltojson.output.json",
  "excludePatterns": [
    "**/tag/**",
    "**/tags/**",
    "**/#*"
  ]
}
```

## 🎯 Advanced Usage

### Selecting Content

The `selector` option supports any valid CSS selector. Examples:

```bash
# Single element
article.main-content

# Multiple elements
.post-content, .comments

# Nested elements
article .content p

# Complex selectors
main article:not(.ad) .content
```

### URL Pattern Matching

The `match` pattern supports glob-style matching:

```bash
# Match exact path
https://example.com/blog/

# Match all blog posts
https://example.com/blog/**

# Match specific sections
https://example.com/blog/2024/**
https://example.com/blog/*/technical/**
```

### Exclude Patterns

Customize `excludePatterns` for your needs:

```json
{
  "excludePatterns": [
    "**/tag/**",        // Tag pages
    "**/category/**",   // Category pages
    "**/page/*",        // Pagination
    "**/wp-admin/**",   // Admin pages
    "**?preview=true",  // Preview pages
    "**.pdf",           // PDF files
    "**/feed/**",       // RSS feeds
    "**/print/**"       // Print pages
  ]
}
```

## 📄 Output Format

The crawler generates a JSON file with the following structure:

```json
[
  {
    "url": "https://example.com/page1",
    "content": "Extracted content...",
    "timestamp": "2024-11-02T12:00:00.000Z",
    "level": 0
  },
  {
    "url": "https://example.com/page2",
    "content": "More content...",
    "timestamp": "2024-11-02T12:00:10.000Z",
    "level": 1
  }
]
```

### Fields:
- `url`: The normalized URL of the crawled page
- `content`: Extracted text content based on selector
- `timestamp`: ISO timestamp of when the page was crawled
- `level`: Depth level from the starting URL (0-based)

## 🎯 Use Cases

1. **Content Migration**
   - Crawl existing website content
   - Export to structured format
   - Import into new platform

2. **Training Data Collection**
   - Gather content for ML models
   - Create datasets for NLP
   - Build content classifiers

3. **Content Archival**
   - Archive website content
   - Create backups
   - Document snapshots

4. **SEO Analysis**
   - Extract meta content
   - Analyze content structure
   - Track content changes

5. **Documentation Collection**
   - Crawl documentation sites
   - Create offline copies
   - Generate searchable indexes

## 🛠️ Development

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/crawltojson.git
cd crawltojson
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

4. Link for local testing:
```bash
npm link
```

### Development Commands

```bash
# Run build
npm run build

# Clean build
npm run clean

# Run tests
npm test

# Watch mode
npm run dev
```

### Publishing

1. Update version:
```bash
npm version patch|minor|major
```

2. Build and publish:
```bash
npm run build
npm publish
```

## ❗ Troubleshooting

### Common Issues

1. **Browser Installation Failed**
```bash
# Manual installation
npx playwright install chromium
```

2. **Permission Errors**
```bash
# Fix CLI permissions
chmod +x ./dist/cli.js
```

3. **Build Errors**
```bash
# Clean install
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### Debug Mode

Set DEBUG environment variable:
```bash
DEBUG=crawltojson* crawltojson crawl
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

### Coding Standards

- Use ESLint configuration
- Add tests for new features
- Update documentation
- Follow semantic versioning

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Playwright](https://playwright.dev/)
- CLI powered by [Commander.js](https://github.com/tj/commander.js/)
- Inspired by web scraping communities

---

Made with ❤️ by [Vivek M. Agarwal](https://github.com/vivmagarwal/crawltojson)