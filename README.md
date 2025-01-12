# GamesDexer API

A web scraper API built with Node.js, Express, and Cheerio that searches multiple repack websites (e.g., SteamRIP, FitGirl, DODI, and xatab) for content based on user-provided search terms.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/vo1x/api.gamesdexer.vercel.app.git
   cd api.gamesdexer.vercel.app
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Start the server:
   ```bash
   bun run dev
   ```

   The server will run on `http://localhost:3000`.

## API Endpoints

### `GET /search`

Searches the specified repack websites for the given query.

#### Query Parameters

```text
q        (string) - Required. The search term.
repacks  (string) - Optional. Comma-separated list of repack sources (e.g., steamrip,fitgirl). Defaults to steamrip.
```

#### Example Request

```bash
GET /search?q=elden+ring&repacks=steamrip,fitgirl
```

#### Example Response

```json
{
  "success": true,
  "query": "elden ring",
  "sources": ["steamrip", "fitgirl"],
  "results": [
    {
      "name": "Elden Ring Repack",
      "date": "January 10, 2025",
      "repack": "FitGirl",
      "url": "https://fitgirl-repacks.site/elden-ring",
      "source": "https://fitgirl-repacks.site"
    },
    {
      "name": "Elden Ring SteamRip",
      "date": "January 5, 2025",
      "repack": "SteamRIP",
      "url": "https://steamrip.com/elden-ring",
      "source": "https://steamrip.com"
    }
  ]
}
```

## Adding New Repack Sources

1. Open `src/config/scrapers.ts`.
2. Add a new entry to the `SCRAPERS` object:
   ```typescript
   newRepack: {
     name: "NewRepack",
     url: "https://newrepack.com",
     selectors: {
       container: ".post-class",
       title: ".title-class",
       date: ".date-class",
     },
   },
   ```

3. Restart the server, and the new source will be available.

---

Feel free to contribute or report issues to improve this project!
