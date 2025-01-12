import { ScraperConfig } from "../interfaces/interfaces";

export const SCRAPERS: Record<string, ScraperConfig> = {
  steamrip: {
    name: "SteamRIP",
    url: "https://steamrip.com",
    selectors: {
      container: ".post-element",
      title: ".the-post-title",
    },
  },
  fitgirl: {
    name: "FitGirl",
    url: "https://fitgirl-repacks.site",
    selectors: {
      container: ".entry-title",
      title: "a",
      date: ".entry-meta .entry-date time",
    },
  },
  dodi: {
    name: "DODI",
    url: "https://game-repack.site",
    selectors: {
      container: ".entry-title",
      title: "a",
      date: "time.entry-date.published",
    },
  },
  xatab: {
    name: "xatab",
    url: "https://byxatab.com",
    selectors: {
      container: ".entry__title",
      title: "a",
      date: ".entry__info-categories",
    },
  },
};
