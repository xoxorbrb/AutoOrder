import puppeteer from "puppeteer";

// 이미 스크랩한 url 제외하기 위한 저장할 Set
const scrapedUrls = new Set<string>();

// 값 가져오는 url 크롤링

export async function scrapeUrls(mainURL: string) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(mainURL, { waitUntil: "networkidle2" });
}

async function scrapeNewURL(page: puppeteer.Page) {}
