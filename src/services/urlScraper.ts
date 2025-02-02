import puppeteer from "puppeteer";
import type { Page, Browser } from "puppeteer";
// 이미 스크랩한 url 제외하기 위한 저장할 Set
const scrapedUrls = new Set<string>();

// 값 가져오는 url 크롤링

export async function scrapeUrls(mainURL: string) {
  const browser: Browser = await puppeteer.launch();
  const page: Page = await browser.newPage();
  await page.goto(mainURL, { waitUntil: "networkidle2" });
}

async function scrapeNewUrls(page: Page) {
  const urls: string[] = await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll("a")); // 링크 수집 (a태그)  // 여기는 수정 필요함
    return links
      .map((link) => link.getAttribute("href"))
      .filter((url) => url !== null) as string[];
  });

  const newUrls = urls.filter((url) => !scrapedUrls.has(url)) as string[];

  if (newUrls.length > 0) {
    console.log(`새로운 URL 발견 ${newUrls.length}개`);
    newUrls.forEach((url) => {
      scrapedUrls.add(url);
      console.log(`URL 저장: ${url}`);
    });
  } else {
    console.log("새로운 url 없음");
  }
}
