import * as cheerio from "cheerio";
import { Request, Response } from "express";

interface ISearchResult {
  name: string;
  version: string;
  repack: string;
  url?: string;
  source: string;
}

interface ScraperConfig {
  name: string;
  url: string;
  selectors: {
    container: string;
    title: string;
    version: string;
  };
}

const SCRAPERS: Record<string, ScraperConfig> = {
  steamrip: {
    name: "SteamRIP",
    url: "https://steamrip.com",

    selectors: {
      container: ".post-element",
      title: ".the-post-title",
      version: ".tagmetafield",
    },
  },
  fitgirl: {
    name: "FitGirl",
    url: "https://fitgirl-repacks.site",
    selectors: {
      container: ".entry-title",
      title: "a",
      version: ".entry-content",
    },
  },
  dodi: {
    name: "DODI",
    url: "https://game-repack.site",
    selectors: {
      container: ".entry-title",
      title: "a",
      version: ".entry-content",
    },
  },
  xatab: {
    name: "xatab",
    url: "https://byxatab.com",
    selectors: {
      container: ".entry__title",
      title: "a",
      version: ".entry-content",
    },
  },
};

const searchController = {
  async scrapeWebsite(
    searchTerm: string,
    config: ScraperConfig
  ): Promise<ISearchResult[]> {
    try {
      console.log(`${config.url}/?s=${encodeURIComponent(searchTerm)}`);
      const scrapeUrl =
        config.name === "xatab"
          ? `${config.url}/search/${encodeURIComponent(searchTerm)}`
          : `${config.url}/?s=${encodeURIComponent(searchTerm)}`;
      const response = await fetch(scrapeUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          Connection: "keep-alive",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      const results: ISearchResult[] = [];

      $(config.selectors.container).each((_, element) => {
        const name = $(element).find(config.selectors.title).text().trim();
        const version = $(element).find(config.selectors.version).text().trim();
        const url = $(element).find("a").attr("href");

        if (name) {
          results.push({
            name,
            version,
            repack: config.name,
            url:
              config.name.toLowerCase() === "steamrip"
                ? `${config.url}/${url}`
                : url,
            source: new URL(config.url).toString(),
          });
        }
      });

      return results;
    } catch (error) {
      console.error(`Error scraping ${config.url}:`, error);
      return [];
    }
  },

  async search(req: Request, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const repacks = ((req.query.repacks as string) || "steamrip").split(",");

      if (!searchTerm) {
        res
          .status(400)
          .json({ success: false, message: "Search term is required" });
      }

      const validRepacks = repacks.filter(
        (repack) => SCRAPERS[repack.toLowerCase()]
      );

      if (validRepacks.length === 0) {
        res.status(400).json({
          success: false,
          message: "No valid repack sources provided",
        });
      }

      const scrapePromises = validRepacks.map((repack) =>
        searchController.scrapeWebsite(
          searchTerm,
          SCRAPERS[repack.toLowerCase()]
        )
      );

      const results = await Promise.allSettled(scrapePromises); // research later
      const searchResults = results
        .map((result, index) => {
          if (result.status === "fulfilled") {
            return result.value;
          } else {
            console.error(
              `Error scraping ${validRepacks[index]}:`,
              result.reason
            );
            return [];
          }
        })
        .flat();

      res.json({
        success: true,
        query: searchTerm,
        sources: validRepacks,
        results: searchResults,
      });
    } catch (error) {
      console.error("Error in search controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};

export default searchController;
