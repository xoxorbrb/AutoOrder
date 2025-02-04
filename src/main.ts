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
const ssUrl = "https://samsincall.com/partners/orders/";
const roseUrl = "http://16441644.roseweb.co.kr/index.htm";
async function scrapeAndAutoInput() {
  const ssBrowser: Browser = await puppeteer.launch(); //samsin 브라우저
  const ssPage: Page = await ssBrowser.newPage();

  while (isRunning) {
    const newUrls: string[] = await scrapUrls.scrapeNewUrls(ssPage);
    newUrls.forEach(async (url: string) => {}); // 스크랩한 url -> 데이터 추출 -> 엑셀 데이터 추가 -> 데이터 자동 입력 -> 클릭까지
  }
}

export function stopScrapping() {
  isRunning = false;
  console.log("스크랩 중지");
}

// 로그인 상태 확인 및 로그인 자동화
async function sessionCheckAndSetLogin(
  page: Page,
  url: string,
  id: string,
  password: string
) {
  await page.goto(url, {
    waitUntil: "networkidle2",
  });

  if (url === ssUrl) {
    // 알림 감지
    let alertOn = false;
    page.on("dialog", async (dialog) => {
      alertOn = true;
      await dialog.dismiss(); // 알럿창 끄기
    });
    if ((alertOn = true)) {
      await page.reload({ waitUntil: "networkidle2" });

      const currentUrl = page.url();

      if (currentUrl.includes("/login")) {
        console.log("삼신상사 로그인되지 않은 상태, 로그인 필요");
        await page.evaluate(() => {
          const idField = document.querySelector(
            'input[name="member_id"]'
          ) as HTMLInputElement;
          const pwField = document.querySelector(
            'input[name="member_pw"]'
          ) as HTMLInputElement;
          idField.value = ""; //아이디 입력 필드 초기화 (중복방지)
          pwField.value = ""; //패스워드 입력 필드 초기화  (중복방지)
        });

        await page.type('input[name="member_id"]', id);
        await page.type('input[name="member_pw"]', password);
      }
    }
  }
}
