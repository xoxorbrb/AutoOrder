import puppeteer, { Browser, Page } from "puppeteer";
import * as scrapUrls from "./services/urlScraper";

// interface urls {
//   url: string;
//   title: string;
//   compName: string;
//   userName: string;
//   userTel: string;
//   userPhone: string;
//   address: string;
// }

// 1분마다 새로고침을 위한 1분 변수
const intervalTime = 60000;
// 스크랩 루프 상태 관리 플래그
let isRunning: boolean = true;

const orderSearchWord: string = "굿";
const contactSearchWord: string = "본부";

async function scrapeAndAutoInput(mainURL: string) {
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  await page.goto(mainURL, { waitUntil: "networkidle2" });

  while (isRunning) {
    const newUrls: string[] = await scrapUrls.scrapeNewUrls(page);
    newUrls.forEach(async (url: string) => {}); // 스크랩한 url -> 데이터 추출 -> 엑셀 데이터 추가 -> 데이터 자동 입력 -> 클릭까지
  }
}

export function stopScrapping() {
  isRunning = false;
  console.log("스크랩 중지");
}
