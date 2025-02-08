import type { Page } from "puppeteer";
// 이미 스크랩한 url 제외하기 위한 저장할 Set
export const ssScrapedUrls = new Set<string>();
export const roseScrapedUrls = new Set<string>();
export async function ssScrapeNewUrls(page: Page): Promise<string[]> {
  //삼신상사
  const urls: string[] =
    (await page.$$eval(
      "a",
      (anchors, baseUrl) => {
        return anchors
          .map((anchor) => {
            const href = (anchor as HTMLAnchorElement).getAttribute("href");
            return new URL(href || "", baseUrl).href as string;
          })
          .filter((url: string) => {
            url.includes("/detail/?order_no=");
          });
      },
      page.url() //baseUrl 매개변수 값
    )) || [];

  const newUrls = urls.filter((url) => !ssScrapedUrls.has(url)) as string[]; // 이전에 데이터를 얻어온 url을 제외한 url가져오기

  if (newUrls.length > 0) {
    console.log(`[삼신상사] 새로운 URL 발견 ${newUrls.length}개`);
    newUrls.forEach((url) => {
      ssScrapedUrls.add(url);
      console.log(`[삼신상사] URL 저장: ${url}`);
    });
    return newUrls;
  } else {
    console.log("[삼신상사] 새로운 url 없음");
    return [];
  }
}

export async function roseScrapedNewUrls(page: Page): Promise<string[]> {
  let urls: string[] = [];
  await page.$$eval(
    "a",
    (anchors, baseUrl) => {
      anchors.forEach((anchor) => {
        const onClickAttr = (anchor as HTMLAnchorElement).getAttribute(
          "onCiick"
        );
        if (onClickAttr && onClickAttr.length > 0) {
          const urlMatch: RegExpMatchArray | null = onClickAttr.match(
            /window\.open\(['"]([^'"]+)['"]/
          );
          const url = new URL(urlMatch ? urlMatch[1] : "", baseUrl)
            .href as string;
          urls.push(url);
        }
      });
    },
    page.url()
  );

  const newUrls = urls.filter((url) => !roseScrapedUrls.has(url)) as string[];

  if (newUrls && newUrls.length > 0) {
    console.log(`[플라워 인트라넷] 새로운 URL 발견: ${newUrls.length}개`);
    newUrls.forEach((url) => {
      roseScrapedUrls.add(url);
      console.log(`[플라워 인트라넷] URL 저장: ${url}`);
    });
    return newUrls;
  } else {
    console.log(`[플라워 인트라넷] 새로운 URL 없음`);
    return [];
  }
}
