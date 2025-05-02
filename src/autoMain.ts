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
let startDate = "";
let stopDate = "";

let mainWindow: BrowserWindow;
const path = require("path");
export async function scrapeAndAutoInput(data: any) {
  console.log("🚀 autoMain.ts 실행됨!", data);
  // const mainWindow = BrowserWindow.getAllWindows()[0];

  if (data.disable === "Y") {
    return;
  }

  const chromiumPath = path.join(
    process.resourcesPath,
    "chromium",
    "chrome.exe"
  );

  const ssBrowser: Browser = await puppeteer.launch({
    headless: false, // GUI 실행 (숨김 모드: true)
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: chromiumPath,
  }); //samsin 브라우저
  const ssPages: Page[] = await ssBrowser.pages();
  const ssPage: Page = ssPages[0];
  await ssPage.setViewport({ width: 1280, height: 800 });

  const rnmBrowser: Browser = await puppeteer.launch({
    headless: false, // GUI 실행 (숨김 모드: true)
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: chromiumPath,
  });
  const rnmPages: Page[] = await rnmBrowser.pages();
  const rnmPage: Page = rnmPages[0];
  await rnmPage.setViewport({ width: 1280, height: 800 });

  const roseBrowser: Browser = await puppeteer.launch({
    headless: false, // GUI 실행 (숨김 모드: true)
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: chromiumPath,
  }); //1644 브라우저
  const rosePages: Page[] = await roseBrowser.pages();
  const rosePage: Page = rosePages[0];
  await rosePage.setViewport({ width: 1280, height: 800 });

  ssId = data.ss.id;
  ssPw = data.ss.pw;
  roseId = data.rose.id;
  rosePw = data.rose.pw;
  roseKey = data.rose.key;
  ssRnmId = data.ssRnm.id;
  ssRnmPw = data.ssRnm.pw;
  roseRnmId = data.roseRnm.id;
  roseRnmPw = data.roseRnm.pw;
  startDate = data.startDate + " " + "00:00";
  stopDate = data.stopDate + " " + "23:59";

  const run = async () => {
    if (!isRunning) {
      return;
    }

    let now = new Date();
    const mainWindow = BrowserWindow.getAllWindows()[0];
    setMainWindow(mainWindow);

    sendToLog(now.toString() + " 실행");

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
      startDate,
      stopDate
    );

    await autoLogin.sessionCheckAndSetLogin(
      rnmPage,
      rnmBasicUrl,
      roseRnmId,
      roseRnmPw
    );

    for (const roseUrl of roseNewUrls) {
      let data = await scrapData.roseOrderDataScraper(roseUrl, roseBrowser);
      await autoInput.roseSendInput(data, rnmPage, rnmBrowser);
    }
    await autoLogin.logoutRNM(rnmPage);

    await autoLogin.sessionCheckAndSetLogin(ssPage, ssBasicUrl, ssId, ssPw); // 필요 시 로그아웃 이벤트 잡아서 바로 중지하는 거 개발 필요, 현재로서는 딱히 세션 끊는게 보이지 않아서 1분에 한번씩 체크하도록 되어있음

    /**
     * 1. 삼신 url 가져오기 -> 데이터 스크랩 -> rnm 삼신 발주아이디로 로그인 -> 발주 데이터 입력 -> 삼신 발주아이디 로그아웃
     * 2. 플라워 url 가져오기 -> 데이터 스크랩 -> rnm 플라워 발주아이디로 로그인 -> 발주 데이터 입력 -> 플라워 발주아이디 로그아웃
     */

    const ssNewUrls: string[] = await scrapUrls.ssScrapeNewUrls(
      ssPage,
      startDate,
      stopDate
    );
    // rnm 아이디 로그인 (삼신 발주 아이디로 해야됨)
    await autoLogin.sessionCheckAndSetLogin(
      rnmPage,
      rnmBasicUrl,
      ssRnmId,
      ssRnmPw
    );

    for (const ssUrl of ssNewUrls) {
      let data = await scrapData.ssOrderDataScraper(ssUrl, ssBrowser);
      await autoInput.ssSendInput(data, rnmPage, rnmBrowser);
    }
    await autoLogin.logoutRNM(
      rnmPage //로그아웃 url
    );

    sendToLog(". . . 완료 후 기다리는중 . . .");
  };

  await run();

  const interval = setInterval(run, 60000);
}

export function stopScrapping() {
  isRunning = false;
}

export function sendToLog(message: string) {
  mainWindow?.webContents.send("log-message", message);
}
export function setMainWindow(window: BrowserWindow) {
  mainWindow = window;
}
