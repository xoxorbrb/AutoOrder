import type { Page } from "puppeteer";
// 이미 스크랩한 url 제외하기 위한 저장할 Set
export const ssScrapedUrls = new Set<string>();

export async function ssScrapeNewUrls(page: Page): Promise<string[]> {
  //삼신상사
  const urls: string[] =
    (await page.$$eval(
      "a",
      (links, baseUrl) => {
        return links
          .map((link) => {
            const href = (link as HTMLAnchorElement).getAttribute("href");
            return new URL(href || "", baseUrl).href;
          })
          .filter((url: string) => {
            url.includes("/detail/?order_no=");
          });
      },
      page.url()
    )) || [];

  const newUrls = urls.filter((url) => !ssScrapedUrls.has(url)) as string[]; // 이전에 데이터를 얻어온 url을 제외한 url가져오기

  if (newUrls.length > 0) {
    console.log(`새로운 URL 발견 ${newUrls.length}개`);
    newUrls.forEach((url) => {
      ssScrapedUrls.add(url);
      console.log(`URL 저장: ${url}`);
    });
    return newUrls;
  } else {
    console.log("새로운 url 없음");
    return [];
  }
}
