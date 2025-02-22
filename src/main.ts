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
const ssUrl: string = "https://samsincall.com/partners/orders/";
const roseUrl: string = "http://16441644.roseweb.co.kr/index.htm";
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

// 로그인 상태 확인 및 로그인 자동화
async function sessionCheckAndSetLogin(
  page: Page,
  url: string,
  id: string,
  password: string,
  key: string = "" // 플라워 인트라넷 key 값
) {
  await page.goto(url, {
    waitUntil: "load",
  });

  if (url === ssUrl) {
    // 알림 감지
    let alertOn = false;
    page.on("dialog", async (dialog) => {
      alertOn = true;
      await dialog.dismiss(); // 알럿창 끄기
    });
    if ((alertOn = true)) {
      await page.reload({ waitUntil: "load" });

      const currentUrl = page.url();

      if (currentUrl.includes("/login")) {
        console.log("[삼신상사] 로그인되지 않은 상태, 로그인 필요");
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

        // 로그인 정보 입력
        await page.type('input[name="member_id"]', id);
        await page.type('input[name="member_pw"]', password);

        await Promise.all([
          page.click('input[id="btn-login"]'),
          page.waitForNavigation({ waitUntil: "load" }),
        ]);

        let afterUrl = page.url();

        if (!afterUrl.includes("/login")) {
          console.log("[삼신상사] 로그인 성공");
        } else {
          console.log("[삼신상사] 로그인 실패");
          stopScrapping();
        }
      } else {
        console.log("[삼신상사]로그인 되어있음");
      }
    }
  } else if (url === roseUrl) {
    let loginButtonExists = (await page.$('input[alt="로그인버튼"]')) !== null;

    if (loginButtonExists) {
      console.log("[플라워 인트라넷] 로그인 되지 않은 상태");

      await page.evaluate(() => {
        const idField = document.querySelector(
          'input[name="sid"]'
        ) as HTMLInputElement;
        const pwField = document.querySelector(
          'input[name="spw"]'
        ) as HTMLInputElement;
        const keyField = document.querySelector(
          'input[name="skey"]'
        ) as HTMLInputElement;

        //입력필드 초기화
        idField.value = "";
        pwField.value = "";
        keyField.value = "";
      });
      // 로그인 정보 입력
      await page.type('input[name="sid"]', id);
      await page.type('input[name="spw"]', password);
      await page.type('input[name="skey"]', key);

      await Promise.all([
        page.click('input[alt="로그인버튼"]'),
        page.waitForNavigation({ waitUntil: "load" }),
      ]);
      loginButtonExists = (await page.$('input[alt="로그인버튼"]')) !== null;

      if (loginButtonExists) {
        console.log("[플라워 인트라넷] 로그인 성공");
      } else {
        console.log("[플라워 인트라넷] 로그인 실패");
        stopScrapping();
      }
    }
  }
}
