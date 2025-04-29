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

export async function roseScrapedNewUrls(
  page: Page,
  startDate: string,
  stopDate: string
): Promise<string[]> {
  sendToLog("[플라워 인트라넷] 미확인 수주 목록 스크랩");
  sendToLog("[플라워 인트라넷] 희망배송일: " + startDate + " 이후 정보 스크랩");
  sendToLog("[플라워 인트라넷] 희망배송일: " + stopDate + " 이전 정보 스크랩");
  console.log("startDate: " + startDate);

  const allUrls = [];
  const [datePart, timePart] = startDate.split(" ");
  let [year, month, day]: [number, number, number] = [0, 0, 0];

  [year, month, day] = datePart.split("-").map(Number);

  let syear: string = `${year}${month.toString().padStart(2, "0")}`;
  console.log(syear);
  // await page.waitForSelector('select[name="bstatus"]');

  page.on("console", (msg) => sendToLog("[플라워 인트라넷] " + msg.text()));
  let index = 1;
  while (true) {
    let sujuUrl = `http://16441644.roseweb.co.kr/list/suju_ajaxc.htm?syear=${syear}&sortname=bdate&sort=desc&keyset=&searchword=&keyset2=&sdate=&edate=&page=${index}&mode=`;
    await page.goto(sujuUrl);
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve(); // Promise 해결
      }, 1000); // 1초 대기
    });

    const { urls, isLastPage } = await page.$$eval(
      "tr",
      (rows, baseUrl, startDate, stopDate) => {
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
        let isLast = false;
        const start = parseCustomDateTime(startDate);
        const end = parseCustomDateTime(stopDate);
        const urls: string[] = [];
        rows.forEach((row) => {
          const tds = Array.from(row.querySelectorAll("td"));
          const linkElement = tds[0]?.querySelector("a"); // 첫 번째 td에서 a 태그 찾기 (url)

          // 희망배송일
          const rowDate = tds[3]?.textContent || "";
          const matched = rowDate.match(/\d{2}-\d{2}-\d{2}/g);
          let tempDate = "";
          if (matched && matched.length > 1) {
            tempDate = matched[1];
          }
          tempDate += " 00:00";

          let hopeDate = parseCustomDateTime(tempDate);

          const select = row.querySelector(
            'select[name="bstatus"]'
          ) as HTMLSelectElement | null;
          const isNotConfirmed = select?.value === "1";
          let isComplete = select?.value === "4"; //배송완료 확인
          if (isComplete) {
            isLast = true;
          }
          if (
            linkElement &&
            isNotConfirmed &&
            start <= hopeDate &&
            end >= hopeDate
          ) {
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
        return { urls, isLastPage: isLast };
      },
      "http://16441644.roseweb.co.kr/list/",
      startDate,
      stopDate
    );
    allUrls.push(...urls);
    index += 1;

    if (isLastPage) {
      sendToLog(
        "배송완료가 있으므로 마지막 페이지로 확인되어 url 스크랩을 종료합니다. (다음페이지에도 미확인 건들 존재할 경우 관리자에게 문의해주세요.)"
      );
      break;
    }
  }
  sendToLog(`[플라워 인트라넷] 미확인 URL ${allUrls.length}개`);
  const newUrls = allUrls.filter(
    (url) => !roseScrapedUrls.has(url)
  ) as string[];

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
