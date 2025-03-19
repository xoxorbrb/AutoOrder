import { ElementHandle, type Page } from "puppeteer";
import { sendToLog } from "../autoMain";
// 이미 스크랩한 url 제외하기 위한 저장할 Set
export const ssScrapedUrls = new Set<string>();
export const roseScrapedUrls = new Set<string>();
export async function ssScrapeNewUrls(
  page: Page,
  date: string
): Promise<string[]> {
  sendToLog("[삼신상사] date: " + date + " 이후 정보 스크랩");
  page.on("console", (msg) => sendToLog("[삼신상사] " + msg.text()));
  await page.waitForSelector("tr");

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      console.log("1초가 지났습니다!"); // resolve 전에 console.log 찍기
      resolve(); // Promise 해결
    }, 1000); // 1초 대기
  });
  const urls: string[] = await page.$$eval(
    "tr",
    (rows, baseUrl, date) => {
      const urls: string[] = [];
      function parseCustomDateTime(
        dateTimeStr: string,
        type: string = "basic"
      ): Date {
        const [datePart, timePart] = dateTimeStr.split(" ");
        let [year, month, day]: [number, number, number] = [0, 0, 0];
        if (type === "ss") {
          [year, month, day] = datePart.split(".").map(Number);
        } else {
          [year, month, day] = datePart.split("-").map(Number);
        }

        const [hour, minute] = timePart.split(":").map(Number);

        // 연도를 2000년대 기준으로 변환 (예: "25" → 2025년)
        const fullYear = year < 100 ? 2000 + year : year;

        return new Date(fullYear, month - 1, day, hour, minute);
      }
      const inputDate = parseCustomDateTime(date);
      rows.forEach((row) => {
        const computedStyle = window.getComputedStyle(row);
        if (
          computedStyle.backgroundColor === "rgb(227, 243, 246)" ||
          computedStyle.backgroundColor === "rgb(251, 241, 246)" ||
          computedStyle.backgroundColor === "rgb(138, 250, 175)"
        ) {
          console.log("URL 찾기");
        } else {
          return;
        }

        const tds = row.querySelectorAll("td");
        const linkElement = tds[0]?.querySelector("a"); // 첫 번째 td에서 a 태그 찾기 (url)
        const dateText =
          tds[1]?.querySelector("div")?.textContent?.trim() || ""; // 두 번째 td의 첫 div 찾기 (시간)
        if (linkElement && dateText) {
          const rowDate = parseCustomDateTime(dateText, "ss");
          if (rowDate > inputDate) {
            console.log("입력한 시간보다 이후의 주문: " + rowDate);
            urls.push(new URL(linkElement.href, baseUrl).href); // URL 절대경로로 변환
          }
        }
      });
      return urls;
    },
    page.url(),
    date
  );

  const newUrls = urls.filter((url) => !ssScrapedUrls.has(url)) as string[]; // 이전에 데이터를 얻어온 url을 제외한 url가져오기

  if (newUrls.length > 0) {
    sendToLog(`[삼신상사] 새로운 URL 발견 ${newUrls.length}개`);
    newUrls.forEach((url) => {
      ssScrapedUrls.add(url);
      sendToLog(`[삼신상사] URL 저장: ${url}`);
    });
    return newUrls;
  } else {
    sendToLog("[삼신상사] 새로운 url 없음");
    return [];
  }
}

export async function roseScrapedNewUrls(
  page: Page,
  date: string
): Promise<string[]> {
  let urls: string[] = [];
  await page.waitForSelector("tr");

  await page.$$eval(
    "tr",
    (rows, baseUrl, date) => {
      function parseCustomDateTime(dateTimeStr: string): Date {
        const [datePart, timePart] = dateTimeStr.split(" ");
        let [year, month, day]: [number, number, number] = [0, 0, 0];
        [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute] = timePart.split(":").map(Number);

        // 연도를 2000년대 기준으로 변환 (예: "25" → 2025년)
        const fullYear = year < 100 ? 2000 + year : year;

        return new Date(fullYear, month - 1, day, hour, minute);
      }
      const inputDate = parseCustomDateTime(date);
      rows.filter((row) => {
        const tds = row.querySelectorAll("td");
        const linkElement = tds[0]?.querySelector("a"); // 첫 번째 td에서 a 태그 찾기 (url)
        const dateText =
          tds[1]?.querySelector("div")?.textContent?.trim() || ""; // 두 번째 td의 첫 div 찾기 (시간)

        if (linkElement && dateText) {
          // const rowDate = parseCustomDateTime(dateText);
          const rowDate = inputDate;
          if (rowDate > inputDate) {
            // urls.push(new URL(linkElement.href, baseUrl).href); // URL 절대경로로 변환
            const link: string =
              linkElement
                .getAttribute("onclick")
                ?.match(/window\.open\(['"]([^'"]+)['"]/)?.[1] || "";
            const href: string = baseUrl + link;
            urls.push(href);
          }
        }
      });
    },
    "http://16441644.roseweb.co.kr",
    date
  );
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
    sendToLog(`[플라워 인트라넷] 새로운 URL 발견: ${newUrls.length}개`);
    newUrls.forEach((url) => {
      roseScrapedUrls.add(url);
      sendToLog(`[플라워 인트라넷] URL 저장: ${url}`);
    });
    return newUrls;
  } else {
    sendToLog(`[플라워 인트라넷] 새로운 URL 없음`);
    return [];
  }
}
