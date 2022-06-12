# Apify Baidu Scraper

Free Scraper for Baidu Search engine. Available [here](https://console.apify.com/actors/eUzzSmb1tYIbQd0Oj) in Apify console

## Crawled data

Data result object has currently following structure:

```typescript
interface DataResults {
  results: ResultLink[];
  hotSearchResults?: Link[];
  relatedSearchKeywords?: string[];
  similarSearchKeywords?: string[];
  resultsCount?: number;
}
```

When `results` prop returns first 10 results for keyword.
