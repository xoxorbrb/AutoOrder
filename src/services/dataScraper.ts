import puppeteer, { Browser, Page } from "puppeteer";
import { sendToLog } from "../autoMain";

const roseKeyMapping = {
  recipientName: "받는고객명",
  telephone: "전화",
  phone: "휴대폰",
  count: "수량",
  arrivePlace: "배달장소",
  originPrice: "원청금액",
  gPrice: "결제금액",
  message: "경조사어",
  flowerName: "상품정보",
  senderName: "보내는분",
  request: "요청사항",
};

// export interface OrderData {
//   url: string;
//   title: string;
//   compName: string;
//   userName: string;
//   userTel: string;
//   userPhone: string;
//   address: string;
// }
export async function ssOrderDataScraper(
  url: string,
  browser: Browser
): Promise<Object> {
  // 삼신 데이터

  let ssData: { [key: string]: any } = {};
  ssData.url = url;
  // TODO: URL로부터 데이터 수집
  const page: Page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800 });

  await page.goto(url, { waitUntil: "load" });
  sendToLog("[삼신상사] 데이터 수집 합니다.");
  // const rowHeightKeyClass: string[]= ["table-blue", "table-green", "table-gray"]; // 키를 가지고 있는 태그의 클래스 속성
  page.on("console", (msg) => sendToLog("[삼신상사] " + msg.text()));
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve(); // Promise 해결
    }, 1000); // 1초 대기
  });
  //데이터 추출

  console.log(await page.frames().map((f) => f.url()));
  const basicData = await page.$$eval(".row-height", (rows) => {
    const ssKeyMapping = {
      customerName: "고객명",
      phone: "휴대폰1/휴대폰2",
      telephone: "유선전화",
      deliveryAddress: "배송지",
      flowerName: "화환명",
      leftText: "좌측 문구",
      rightText: "우측 문구",
      request: "요청사항",
    };
    let result: { [key: string]: any } = {};
    rows.forEach((row) => {
      const keyTags: HTMLElement[] = Array.from(
        row.querySelectorAll(".table-blue, .table-green")
      );

      const valueTags: HTMLElement[] = Array.from(
        row.querySelectorAll<HTMLElement>(".inside")
      ).filter((el) => !el.closest(".table-blue, .table-green"));

      keyTags.forEach((keyTag, index) => {
        const keyInsideElement = keyTag.querySelector(".inside");
        const valueInsideElement = valueTags[index];
        const key: string = keyInsideElement?.textContent?.trim() || "";
        const value: string = valueInsideElement?.textContent?.trim() || "";
        // 한글명인 키 영어로 매핑
        const mappedKey = Object.keys(ssKeyMapping).find(
          (k: string) => ssKeyMapping[k as keyof typeof ssKeyMapping] === key
        );

        if (mappedKey) {
          console.log(`${mappedKey}: ${value}`);
          result[mappedKey] = value;
        }
      });
    });
    return result;
  });
  ssData = { ...ssData, ...basicData };
  //금액 확인
  const priceParents = await page.$$(
    ".col-xs-3.col-height.col-middle.line-l.line-r"
  );

  if (priceParents) {
    const priceTag = await priceParents[1].$(".inside");
    const price = await priceTag?.evaluate((el) => el.textContent?.trim());

    ssData.price = price;
  }

  //리본데이터 추출
  const ribonData = await page.$$eval(".inside", (insideTags) => {
    let result: { [key: string]: any } = {};
    insideTags.forEach((inside) => {
      const valueList = Array.from(
        inside.querySelectorAll(".row-height:not(.line-t)")
      )
        .filter((element) =>
          element.querySelector(
            ".col-xs-2.col-height.col-middle.line-l.line-r:not(.table-gray)"
          )
        )
        .flatMap((element) =>
          Array.from(element.querySelectorAll(".col-height"))
        )
        .map((el) => el?.textContent?.trim());

      valueList.forEach((value, index) => {
        if (index % 3 === 0) {
          result.flowerName = [...(result.flowerName || []), value];
        } else if (index % 3 === 2) {
          result.rightText = [...(result.rightText || []), value];
        } else if (index % 3 === 1) {
          result.leftText = [...(result.leftText || []), value];
        }
      });
    });
    return result;
  });
  ssData = { ...ssData, ...ribonData };
  sendToLog("[삼신상사] 데이터 추출 결과: " + JSON.stringify(ssData));
  await page.close();
  return ssData;
}

export async function roseOrderDataScraper(
  url: string,
  browser: Browser
): Promise<Object> {
  let roseData: { [key: string]: string } = {};
  roseData.url = url;
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve(); // Promise 해결
    }, 1000); // 1초 대기
  });
  const page: Page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800 });

  //페이지 이동
  await page.goto(url, { waitUntil: "load" });

  //데이터 추출 , 삼신상사와 다르게 값에 모두 아이디가 존재하여 다른방식으로 추출
  const keyName = {
    arrive_name: "받는고객명",
    arrive_tel: "전화",
    arrive_htel: "휴대폰",
    origin_price: "원청금액",
    gprice: "결제금액",
    arrive_place1: "배달장소",
    arrive_place2: "배달장소1",
    ribon: "경조사어",
    good_etc: "상품정보",
    su: "수량",
    ribon_card: "보내는분",
    o_demand: "요청사항",
  };

  for (const key of Object.keys(keyName)) {
    const tagName = keyName[key as keyof typeof keyName];
    let value: string = "";
    if (key === "o_demand") {
      value = await page.$eval(
        `textarea[name=${key}]`,
        (input) => (input as HTMLTextAreaElement).value
      );
    } else {
      value = await page.$eval(
        `input[name=${key}]`,
        (input) => (input as HTMLInputElement).value
      );
    }

    const mapped = Object.keys(roseKeyMapping).find(
      (k: string) =>
        roseKeyMapping[k as keyof typeof roseKeyMapping] === tagName
    );
    if (mapped) {
      roseData[mapped] = value;
    }
  }
  sendToLog("[플라워 인트라넷] 데이터 추출 결과: " + JSON.stringify(roseData));
  await page.close();
  return roseData;
}
