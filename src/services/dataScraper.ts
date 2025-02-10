import puppeteer, { Browser, Page } from "puppeteer";

const keyMapping = {
  orderNum: "주문번호",
  status: "상태",
  orderTime: "발주시간",
  deliveryTime: "배송시간",
  clientName: "이마트",
  customerName: "고객명",
  affiliation: "소속",
  phone: "휴대폰1/휴대폰2",
  telephone: "유선전화",
  deliveryAddress: "배송지",
  requestComment: "요청사항",
  hopeDeliveryDate: "희망배송일",
};

export interface OrderData {
  url: string;
  title: string;
  compName: string;
  userName: string;
  userTel: string;
  userPhone: string;
  address: string;
}
export async function ssOrderDataScraper(url: string, browser: Browser) {
  // 삼신 데이터
  // TODO: URL로부터 데이터 수집
  const page: Page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  // const rowHeightKeyClass: string[]= ["table-blue", "table-green", "table-gray"]; // 키를 가지고 있는 태그의 클래스 속성

  const data = await page.$$eval(".row-height", (row) => {});
}
