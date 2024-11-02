# crawltojson

Crawl websites and convert them to structured JSON with ease. Perfect for creating training data, content migration, or web scraping.

## Quick Start (For Users)

### Installation

```bash
npm install -g crawltojson
```

Or use without installing via npx:
```bash
npx crawltojson
```

### Usage

1. Generate configuration:
```bash
crawltojson config
```

2. Start crawling:
```bash
crawltojson crawl
```

## Development & Publishing

### Local Development

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
crawltojson --help
```

### Making Changes

1. Watch mode for development:
```bash
npm run dev
```

2. Rebuild after changes:
```bash
npm run build
```

### Publishing to npm

1. Login to npm (if not already):
```bash
npm login
```

2. Clean and rebuild:
```bash
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

3. Publish to npm:
```bash
npm publish
```

## Configuration Options

The configuration wizard will help you set up:

- `url`: Starting URL to crawl
- `match`: URL pattern to match (supports glob patterns)
- `selector`: CSS selector to extract content
- `maxPages`: Maximum number of pages to crawl
- `outputFile`: Name of the output JSON file (default: crawltojson.output.json)

## Example

```bash
# Generate config
npx crawltojson config

# Follow the prompts:
# URL: https://example.com
# Pattern: https://example.com/**
# Selector: article
# Max Pages: 100

# Start crawling
npx crawltojson crawl
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

## Common Issues & Troubleshooting

### Clean Install
If you encounter any issues, try a clean install:
```bash
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### Permission Issues
If you get permission errors when running the CLI:
```bash
chmod +x ./dist/cli.js
```

### Build Issues
If the build fails with module resolution errors:
```bash
# Check node version (should be >=14.16)
node --version

# Clear npm cache
npm cache clean --force

# Try rebuilding
npm run build
```

## License

MIT