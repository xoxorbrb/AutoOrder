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

// 스크랩 루프 상태 관리 플래그
let isRunning: boolean = true;

const orderSearchWord: string = "굿";
const contactSearchWord: string = "본부";

async function scrapeAndAutoInput() {
  const ssBrowser: Browser = await puppeteer.launch(); //samsin 브라우저
  const ssPage: Page = await ssBrowser.newPage();

  const autoInputInterval = setInterval(async () => {
    if (isRunning) {
      clearInterval(autoInputInterval);
      console.log("종료");
    }
    const newUrls: string[] = await scrapUrls.ssScrapeNewUrls(ssPage);
    newUrls.forEach(async (url: string) => {}); // 스크랩한 url -> 데이터 추출 -> 엑셀 데이터 추가 -> 데이터 자동 입력 -> 클릭까지
  }, 60 * 1000);
}

export function stopScrapping() {
  isRunning = false;
  console.log("스크랩 중지");
}
