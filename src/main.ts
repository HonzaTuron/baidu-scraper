import { resolveBaiduLink, resolveResultsCount } from "@/utils";
import { Actor } from "apify";
import { PlaywrightCrawler } from "@crawlee/playwright";

interface Link {
  url: string;
  title: string;
}

interface ResultLink extends Link {
  description: string;
}

interface DataResults {
  results: ResultLink[];
  hotSearchResults?: Link[];
  relatedSearchKeywords?: string[];
  similarSearchKeywords?: string[];
  resultsCount?: number;
}

Actor.main(async () => {
  const keyValueStore = await Actor.openKeyValueStore();

  const crawler = new PlaywrightCrawler({
    requestHandler: async ({ page }) => {
      const resultElements = await page.$$("h3");
      const results: ResultLink[] = [];
      for (const titleElement of resultElements) {
        const title = (await titleElement.textContent()) || "";
        const linkElement = await titleElement.$("a");
        const linkUrl = await linkElement?.getAttribute("href");

        const url = linkUrl ? await resolveBaiduLink(linkUrl) : "";

        results.push({ title, description: linkUrl!, url });
      }

      const hotSearchResultElements = await page.$$(
        "div[class^='toplist1-tr']"
      );
      const hotSearchResults: Link[] = [];
      for (const hotSearchElement of hotSearchResultElements.slice(0, 16)) {
        const title = (await hotSearchElement.textContent()) || "";
        const linkElement = await hotSearchElement.$("a");
        const url = (await linkElement?.getAttribute("href")) || "";

        hotSearchResults.push({ title, url });
      }

      const relatedKeywordsElements = await page.$$(
        "div[tpl='recommend_list'] .c-gap-top-xsmall"
      );
      const relatedSearchKeywords: string[] = [];
      for (const relatedKeywordsElement of relatedKeywordsElements) {
        const title = (await relatedKeywordsElement.textContent()) || "";
        relatedSearchKeywords.push(title);
      }

      const similarKeywordsElements = await page.$$("a[class^='rs-link']");
      const similarSearchKeywords: string[] = [];
      for (const similarKeywordsElement of similarKeywordsElements) {
        const title =
          (await similarKeywordsElement.getAttribute("title")) || "";
        similarSearchKeywords.push(title);
      }

      const resultsCountElement = await page.$("span[class^='hint']");
      const resultsCount = resolveResultsCount(
        (await resultsCountElement?.textContent()) || ""
      );

      const dataStructure: DataResults = {
        results,
        hotSearchResults,
        resultsCount,
        similarSearchKeywords,
        relatedSearchKeywords,
      };

      await keyValueStore.setValue("result", dataStructure);
    },
  });

  const { searchPhrases = ["apify"] } =
  (await Actor.getInput<{ searchPhrases: string[] }>()) ?? {};
  await crawler.addRequests(
    searchPhrases.map(
      (searchPhrase) =>
        `https://www.baidu.com/s?wd=${encodeURIComponent(searchPhrase)}`
    )
  );
  await crawler.run();
});
