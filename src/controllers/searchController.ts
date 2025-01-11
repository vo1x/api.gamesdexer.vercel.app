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
};

const searchController = {
  async scrapeWebsite(
    searchTerm: string,
    config: ScraperConfig
  ): Promise<ISearchResult[]> {
    try {
      console.log(`${config.url}/?s=${encodeURIComponent(searchTerm)}`);
      const response = await fetch(
        `${config.url}/?s=${encodeURIComponent(searchTerm)}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );

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
            url: `${config.url}/${url}`,
            source: new URL(config.url).hostname,
          });
        }
      });

      return results;
    } catch (error) {
      console.error(`Error scraping ${config.url}:`, error);
      return [];
    }
  },

  async search(req: Request, res: Response) {
    try {
      const searchTerm = req.query.q as string;
      const repacks = ((req.query.repacks as string) || "steamrip").split(",");

      if (!searchTerm) {
        return res
          .status(400)
          .json({ success: false, message: "Search term is required" });
      }

      const validRepacks = repacks.filter(
        (repack) => SCRAPERS[repack.toLowerCase()]
      );

      if (validRepacks.length === 0) {
        return res.status(400).json({
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

      return res.json({
        success: true,
        query: searchTerm,
        sources: validRepacks,
        results: searchResults,
      });
    } catch (error) {
      console.error("Error in search controller:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  },
};

export default searchController;
