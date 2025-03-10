import type { Page } from "puppeteer";
// 이미 스크랩한 url 제외하기 위한 저장할 Set
export const ssScrapedUrls = new Set<string>();
export const roseScrapedUrls = new Set<string>();
export async function ssScrapeNewUrls(
  page: Page,
  date: string
): Promise<string[]> {
  // //삼신상사
  // const dates: string[] = await page.$$eval(
  //   "div[style=color: rgb(254, 71, 71)]",
  //   (divs) => {
  //     return divs.map((div) => div.textContent || "");
  //   }
  // );

  // const urls: string[] =
  //   (await page.$$eval(
  //     "a",
  //     (anchors, baseUrl) => {
  //       return anchors
  //         .map((anchor) => {
  //           const href = (anchor as HTMLAnchorElement).getAttribute("href");
  //           return new URL(href || "", baseUrl).href as string;
  //         })
  //         .filter((url: string) => {
  //           url.includes("/detail/?order_no=");
  //         });
  //     },
  //     page.url() //baseUrl 매개변수 값
  //   )) || [];

  const inputDate = parseCustomDateTime(date);
  let urls: string[] = [];

  await page.$$eval(
    "tr",
    (rows, baseUrl) => {
      rows.forEach((row) => {
        const computedStyle = window.getComputedStyle(row);
        if (computedStyle.backgroundColor !== "rgb(227, 243, 246)") return;

        const tds = row.querySelectorAll("td");
        const linkElement = tds[0]?.querySelector("a"); // 첫 번째 td에서 a 태그 찾기 (url)
        const dateText =
          tds[1]?.querySelector("div")?.textContent?.trim() || ""; // 두 번째 td의 첫 div 찾기 (시간)

        if (linkElement && dateText) {
          const rowDate = parseCustomDateTime(dateText);

          if (rowDate > inputDate) {
            urls.push(new URL(linkElement.href, baseUrl).href); // URL 절대경로로 변환
          }
        }
      });
    },
    page.url()
  );

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

export async function roseScrapedNewUrls(
  page: Page,
  date: string
): Promise<string[]> {
  let urls: string[] = [];
  const inputDate = parseCustomDateTime(date);

  // await page.$$eval(
  //   "a",
  //   (anchors, baseUrl) => {
  //     anchors.forEach((anchor) => {
  //       const onClickAttr = (anchor as HTMLAnchorElement).getAttribute(
  //         "onCiick"
  //       );
  //       if (onClickAttr && onClickAttr.length > 0) {
  //         const urlMatch: RegExpMatchArray | null = onClickAttr.match(
  //           /window\.open\(['"]([^'"]+)['"]/
  //         );
  //         const url = new URL(urlMatch ? urlMatch[1] : "", baseUrl)
  //           .href as string;
  //         urls.push(url);
  //       }
  //     });
  //   },
  //   page.url()
  // );

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

function parseCustomDateTime(dateTimeStr) {
  const [datePart, timePart] = dateTimeStr.split(" ");
  const [year, month, day] = datePart.split(".").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // 연도를 2000년대 기준으로 변환 (예: "25" → 2025년)
  const fullYear = year < 100 ? 2000 + year : year;

  return new Date(fullYear, month - 1, day, hour, minute);
}
