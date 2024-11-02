# web-to-json

Convert any website into a structured JSON file with ease. Perfect for creating training data, content migration, or web scraping.

## Installation

```bash
npm install -g web-to-json
```

Or use with npx:
```bash
npx web-to-json
```

## Usage

1. Generate configuration:
```bash
webtojson config
```

2. Start crawling:
```bash
webtojson crawl
```

## Configuration Options

The configuration wizard will help you set up:

- `url`: Starting URL to crawl
- `match`: URL pattern to match (supports glob patterns)
- `selector`: CSS selector to extract content
- `maxPages`: Maximum number of pages to crawl
- `outputFile`: Name of the output JSON file (default: webtojson.output.json)

## Example

```bash
# Generate config
npx webtojson config

# Follow the prompts:
# URL: https://example.com
# Pattern: https://example.com/**
# Selector: article
# Max Pages: 100

# Start crawling
npx webtojson crawl
```

## Output Format

The generated JSON file will contain an array of objects:

```json
[
  {
    "url": "https://example.com/page1",
    "content": "Extracted content...",
    "timestamp": "2024-11-02T12:00:00.000Z"
  }
]
```

## License

MIT