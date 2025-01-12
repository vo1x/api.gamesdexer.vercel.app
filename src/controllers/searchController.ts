import * as cheerio from "cheerio";
import { Request, Response } from "express";

import { ISearchResult, ScraperConfig } from "../interfaces/interfaces";
import { SCRAPERS } from "../config/scrapers";

import { formatDate } from "../utils/formatDate";
import { fetchHtml } from "../utils/fetchHtml";

const searchController = {
  async scrapeWebsite(
    searchTerm: string,
    config: ScraperConfig
  ): Promise<ISearchResult[]> {
    try {
      const scrapeUrl =
        config.name === "xatab"
          ? `${config.url}/search/${encodeURIComponent(searchTerm)}`
          : `${config.url}/?s=${encodeURIComponent(searchTerm)}`;

      const html = await fetchHtml(scrapeUrl);
      const $ = cheerio.load(html);
      const results: ISearchResult[] = [];

      $(config.selectors.container).each((_, element) => {
        const name = $(element).find(config.selectors.title).text().trim();
        const url = $(element).find("a").attr("href");

        let date;
        if (config.selectors.date) {
          let rawDate;

          if (config.name === "xatab") {
            const dateElement = $(element)
              .closest(".entry")
              .find(config.selectors.date);
            rawDate = dateElement.text().trim();
          } else {
            const article = $(element).closest("article");
            const dateElement = article.find(config.selectors.date);
            rawDate = dateElement.attr("datetime") || dateElement.text().trim();
          }

          if (rawDate) {
            date = formatDate(rawDate);
          }
        }

        if (name) {
          results.push({
            name,
            date,
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
