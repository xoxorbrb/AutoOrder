import puppeteer, { Browser, Page } from "puppeteer";
import { BrowserWindow } from "electron";
import * as scrapUrls from "./services/urlScraper";
import * as scrapData from "./services/dataScraper";
import * as autoLogin from "./services/autoLogin";
import * as autoInput from "./services/autoInput";

// 스크랩 루프 상태 관리 플래그
let isRunning: boolean = true;

const ssBasicUrl = "https://samsincall.com/partners/orders/";
const roseBasicUrl = "http://16441644.roseweb.co.kr/index.htm";
const rnmBasicUrl = "http://16005423.co.kr/agent/";
let ssId = "";
let ssPw = "";
let roseId = "";
let rosePw = "";
let roseKey = "";
let ssRnmId = "";
let ssRnmPw = "";
let roseRnmId = "";
let roseRnmPw = "";
let date = "";

let mainWindow: BrowserWindow;
export async function scrapeAndAutoInput(data: any) {
  console.log("🚀 autoMain.ts 실행됨!", data);
  const mainWindow = BrowserWindow.getAllWindows()[0];

  const ssBrowser: Browser = await puppeteer.launch({
    headless: false, // GUI 실행 (숨김 모드: true)
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  }); //samsin 브라우저
  const ssPage: Page = await ssBrowser.newPage();
  await ssPage.setViewport({ width: 1280, height: 800 });
  const roseBrowser: Browser = await puppeteer.launch({
    headless: false, // GUI 실행 (숨김 모드: true)
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  }); //1644 브라우저
  const rosePage: Page = await roseBrowser.newPage();
  await rosePage.setViewport({ width: 1280, height: 800 });
  const rnmBrowser: Browser = await puppeteer.launch({
    headless: false, // GUI 실행 (숨김 모드: true)
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const rnmPage: Page = await rnmBrowser.newPage();
  await rnmPage.setViewport({ width: 1280, height: 800 });

  ssId = data.ss.id;
  ssPw = data.ss.pw;
  roseId = data.rose.id;
  rosePw = data.rose.pw;
  roseKey = data.rose.key;
  ssRnmId = data.ssRnm.id;
  ssRnmPw = data.ssRnm.pw;
  roseRnmId = data.roseRnm.id;
  roseRnmPw = data.roseRnm.pw;
  date = data.date + " " + data.time;

  const run = async () => {
    let now = new Date();
    const mainWindow = BrowserWindow.getAllWindows()[0];
    setMainWindow(mainWindow);

    sendToLog(now.toString() + " 로직 실행");
    let isLogin = await autoLogin.sessionCheckAndSetLogin(
      ssPage,
      ssBasicUrl,
      ssId,
      ssPw
    ); // 필요 시 로그아웃 이벤트 잡아서 바로 중지하는 거 개발 필요, 현재로서는 딱히 세션 끊는게 보이지 않아서 1분에 한번씩 체크하도록 되어있음

    /**
     * 1. 삼신 url 가져오기 -> 데이터 스크랩 -> rnm 삼신 발주아이디로 로그인 -> 발주 데이터 입력 -> 삼신 발주아이디 로그아웃
     * 2. 플라워 url 가져오기 -> 데이터 스크랩 -> rnm 플라워 발주아이디로 로그인 -> 발주 데이터 입력 -> 플라워 발주아이디 로그아웃
     */

    const ssNewUrls: string[] = await scrapUrls.ssScrapeNewUrls(ssPage, date);
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
      roseId,
      rosePw,
      roseKey
    );
    await rosePage.reload({ waitUntil: "load" });
    const roseNewUrls: string[] = await scrapUrls.roseScrapedNewUrls(
      rosePage,
      date
    );

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

    sendToLog(". . . 완료 후 기다리는중 . . .");
  };

  await run();

  const interval = setInterval(run, 60000);
}

export function stopScrapping() {
  isRunning = false;
  sendToLog("스크랩 중지");
}

export function sendToLog(message: string) {
  mainWindow?.webContents.send("log-message", message);
}
export function setMainWindow(window: BrowserWindow) {
  mainWindow = window;
}
