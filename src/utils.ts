import axios from "axios";
import cheerio from "cheerio";

/**
 * There's 2 discovered baidu links behaviors
 * - redirect via server response 302,
 * - timed-out custom redirect with custom HTML (status 200)
 * @param url Baidu redirect url. Something like: http://www.baidu.com/link?url=someBasey64Chars
 */
export const resolveBaiduLink = async (url: string): Promise<string> => {
  const { data, headers } = await axios.get<string>(url, {
    maxRedirects: 0,
    validateStatus: (status) => [302, 200].includes(status), // Baidu sometimes returns redirect 302 which leads to Axios error.
  });

  // Redirect location is enough when available (for 302 response)
  if (headers.location) return headers.location;

  // Baidu sometimes returns 200 with custom html - address is available in 'noscript' tag
  const cheerioSelector = cheerio.load(data);

  const noScriptElementContent = cheerioSelector("noscript").html();

  if (!noScriptElementContent) return "";

  const fullUrl = /(')(?:(?=(\\?))\2.)*?\1/.exec(noScriptElementContent);

  return fullUrl?.[1]!;
};

/**
 * Resolves results count string to number
 * @param countText span tag text above first Baidu result, looks like '百度为您找到相关结果约740,000个'
 */
export const resolveResultsCount = (countText: string): number => {
  const digitMatches = [...countText.matchAll(/\d+/g)]; // Thousands are comma-separated, matches will be in groups - ['740', '000']

  const digitString = digitMatches.reduce(
    (digitString, digitMatch) => digitString + digitMatch,
    ""
  );

  return parseInt(digitString);
};
