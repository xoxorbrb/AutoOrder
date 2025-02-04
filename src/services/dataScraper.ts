import puppeteer, { Browser, Page } from "puppeteer";

export interface OrderData {
  url: string;
  title: string;
  compName: string;
  userName: string;
  userTel: string;
  userPhone: string;
  address: string;
}
export async function orderDataScraper(url: string, browser: Browser) {
  // 삼진 데이터
  // TODO: URL로부터 데이터 수집
  const page: Page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });
}
