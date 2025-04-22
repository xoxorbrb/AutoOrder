import { ElementHandle, type Page } from "puppeteer";
import { sendToLog } from "../autoMain";
// 이미 스크랩한 url 제외하기 위한 저장할 Set
export const ssScrapedUrls = new Set<string>();
export const roseScrapedUrls = new Set<string>();
export async function ssScrapeNewUrls(
  page: Page,
  startDate: string,
  stopDate: string
): Promise<string[]> {
  sendToLog("[삼신상사] 희망배송일: " + startDate + " 이후 정보 스크랩");
  sendToLog("[삼신상사] 희망배송일: " + stopDate + " 이전 정보 스크랩");
  const allUrls = [];
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve(); // Promise 해결
    }, 1000); // 1초 대기
  });
  page.on("console", (msg) => sendToLog("[삼신상사] " + msg.text()));
  await page.waitForSelector("tr");

  await page.click("button.btn.btn-info");

  while (true) {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve(); // Promise 해결
      }, 1000); // 1초 대기
    });
    const urls: string[] = await page.$$eval(
      "tr",
      (rows, baseUrl, startDate, stopDate) => {
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
        const start = parseCustomDateTime(startDate);
        const end = parseCustomDateTime(stopDate);
        rows.forEach((row) => {
          const computedStyle = window.getComputedStyle(row);
          if (
            computedStyle.backgroundColor !== "rgb(227, 243, 246)" &&
            computedStyle.backgroundColor !== "rgb(251, 241, 246)" &&
            computedStyle.backgroundColor !== "rgb(138, 250, 175)"
          ) {
            return;
          }
          const tds = row.querySelectorAll("td");
          const linkElement = tds[0]?.querySelector("a"); // 첫 번째 td에서 a 태그 찾기 (url)
          const dateText =
            tds[1]?.querySelectorAll("div")[1]?.textContent?.trim() || ""; // 두 번째 td의 첫 div 찾기 (시간)
          const isChecked =
            tds[8]
              ?.querySelector("table")
              ?.querySelector("tbody")
              ?.querySelector("tr")
              ?.querySelectorAll("td")[4]
              ?.querySelectorAll("div")[1]
              ?.textContent?.trim() === "미확인";

          if (linkElement && dateText && isChecked) {
            const rowDate = parseCustomDateTime(dateText, "ss");
            if (rowDate >= start && rowDate <= end) {
              urls.push(new URL(linkElement.href, baseUrl).href); // URL 절대경로로 변환
            }
          }
        });
        return urls;
      },
      page.url(),
      startDate,
      stopDate
    );
    allUrls.push(...urls);

    const isDisabled = await page
      .$eval("li.page-item.next", (el) => el.classList.contains("disabled"))
      .catch(() => true); //버튼 없는 경우도 종료

    if (isDisabled) {
      break;
    }
    await Promise.all([page.click("li.page-item.next > a")]);
  }
  console.log("allUrls: " + allUrls);
  const newUrls = allUrls.filter((url) => !ssScrapedUrls.has(url)) as string[]; // 이전에 데이터를 얻어온 url을 제외한 url가져오기
  console.log("newUrls: " + newUrls);
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

export async function roseScrapedNewUrls(page: Page): Promise<string[]> {
  sendToLog("[플라워 인트라넷] 미확인 수주 목록 스크랩");

  await page.waitForSelector("tr");

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve(); // Promise 해결
    }, 1000); // 1초 대기
  });

  await page.waitForSelector("select[name=bstatus]");

  page.on("console", (msg) => sendToLog("[플라워 인트라넷] " + msg.text()));
  const urls: string[] = await page.$$eval(
    "tr",
    (rows, baseUrl) => {
      const urls: string[] = [];
      rows.forEach((row) => {
        const tds = Array.from(row.querySelectorAll("td"));
        const linkElement = tds[0]?.querySelector("a"); // 첫 번째 td에서 a 태그 찾기 (url)
        const select = row.querySelector(
          "select[name='bstatus']"
        ) as HTMLSelectElement | null;
        const isNotConfirmed = select?.value === "1";
        if (linkElement && isNotConfirmed) {
          // console.log("url: " + new URL(linkElement.href, baseUrl).href);
          // urls.push(new URL(linkElement.href, baseUrl).href); // URL 절대경로로 변환
          // console.log("urls: " + urls);
          const link: string =
            linkElement
              .getAttribute("onclick")
              ?.match(/window\.open\(['"]([^'"]+)['"]/)?.[1] || "";
          const href: string = baseUrl + link;
          console.log(href);
          if (link) {
            urls.push(href);
          }
        }
      });
      return urls;
    },
    "http://16441644.roseweb.co.kr"
  );

  sendToLog(`[플라워 인트라넷] 미확인 URL ${urls.length}개`);
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
