# Author Lookup

A Chrome extension that extracts author names from [quotes.toscrape.com](https://quotes.toscrape.com) and looks up their data via a local API.

## Prerequisites

- Node.js 20+
- Google Chrome

## Setup

Install dependencies for all packages:

```sh
npm install
cd local-api && npm install
cd ../chrome-extension && npm install
```

## Running the API

Start the local API server on port 3000:

```sh
npm run api:dev
```

Verify it's working:

```
http://localhost:3000/author-data?author=Albert%20Einstein
```

## Chrome Extension

### Build

```sh
npm run ext:build
```

### Load in Chrome

1. Open `chrome://extensions` in Chrome.
2. Enable **Developer mode** (top right toggle).
3. Click **Load unpacked** and select the `chrome-extension/` folder.

### Usage

1. Make sure the local API is running (`npm run api:dev`).
2. Navigate to [quotes.toscrape.com](https://quotes.toscrape.com).
3. Click the Author Lookup extension icon in the toolbar.
4. Click **Get Author Data** to look up the first author on the page.

The popup displays the author's **category**, **difficulty**, and **rate limit**.

## Tests

Run all tests (API + extension):

```sh
npm test
```

Run tests individually:

```sh
npm run api:test    # local API unit + E2E tests
npm run ext:test    # chrome extension unit tests
```
