export interface ISearchResult {
  name: string;
  date: string | undefined;
  repack: string;
  url?: string;
  source: string;
}

export interface ScraperConfig {
  name: string;
  url: string;
  selectors: {
    container: string;
    title: string;
    date?: string;
  };
}
