import puppeteer, { Browser, Page } from "puppeteer";
import * as scrapUrls from "./services/urlScraper";
import * as scrapData from "./services/dataScraper";
import * as autoLogin from "./services/autoLogin";
import * as autoInput from "./services/autoInput";

// 스크랩 루프 상태 관리 플래그
let isRunning: boolean = true;

const ssBasicUrl = "https://samsincall.com/partners/orders/";
const roseBasicUrl = "http://16441644.roseweb.co.kr/index.htm";
const rnmBasicUrl = "http://16005423.co.kr/agent/balju.html";
const ssId = "";
const ssPw = "";
const ssRnmId = "";
const ssRnmPw = "";
const roseRnmId = "";
const roseRnmPw = "";

async function scrapeAndAutoInput() {
  const ssBrowser: Browser = await puppeteer.launch(); //samsin 브라우저
  const ssPage: Page = await ssBrowser.newPage();
  const roseBrowser: Browser = await puppeteer.launch(); //1644 브라우저
  const rosePage: Page = await roseBrowser.newPage();
  const rnmBrowser: Browser = await puppeteer.launch();
  const rnmPage: Page = await rnmBrowser.newPage();

  const autoInputInterval = setInterval(async () => {
    if (isRunning) {
      clearInterval(autoInputInterval);
      console.log("종료");
    }
    await autoLogin.sessionCheckAndSetLogin(ssPage, ssBasicUrl, ssId, ssPw); // 필요 시 로그아웃 이벤트 잡아서 바로 중지하는 거 개발 필요, 현재로서는 딱히 세션 끊는게 보이지 않아서 1분에 한번씩 체크하도록 되어있음
    await ssPage.reload({ waitUntil: "load" });

    /**
     * 1. 삼신 url 가져오기 -> 데이터 스크랩 -> rnm 삼신 발주아이디로 로그인 -> 발주 데이터 입력 -> 삼신 발주아이디 로그아웃
     * 2. 플라워 url 가져오기 -> 데이터 스크랩 -> rnm 플라워 발주아이디로 로그인 -> 발주 데이터 입력 -> 플라워 발주아이디 로그아웃
     */

    const ssNewUrls: string[] = await scrapUrls.ssScrapeNewUrls(ssPage);
    // rnm 아이디 로그인 (삼신 발주 아이디로 해야됨)
    await autoLogin.sessionCheckAndSetLogin(
      rnmPage,
      rnmBasicUrl,
      ssRnmId,
      ssRnmPw
    );

    for (const ssUrl of ssNewUrls) {
      let data = await scrapData.ssOrderDataScraper(ssUrl, ssBrowser);
      await autoInput.ssSendInput(data, rnmPage);
    }
    await autoLogin.logoutRNM(
      rnmPage //로그아웃 url
    );

    await autoLogin.sessionCheckAndSetLogin(
      rosePage,
      roseBasicUrl,
      roseRnmId,
      roseRnmPw
    );
    await rosePage.reload({ waitUntil: "load" });
    const roseNewUrls: string[] = await scrapUrls.roseScrapedNewUrls(rosePage);

    await autoLogin.sessionCheckAndSetLogin(
      rnmPage,
      rnmBasicUrl,
      roseRnmId,
      roseRnmPw
    );

    for (const roseUrl of roseNewUrls) {
      let data = await scrapData.roseOrderDataScraper(roseUrl, roseBrowser);
      await autoInput.roseSendInput(data, rnmPage);
    }
    await autoLogin.logoutRNM(rnmPage);
  }, 60 * 1000);
}

export function stopScrapping() {
  isRunning = false;
  console.log("스크랩 중지");
}
