import puppeteer, { Browser, Page } from "puppeteer";

const ssKeyMapping = {
  customerName: "고객명",
  phone: "휴대폰1/휴대폰2",
  telephone: "유선전화",
  deliveryAddress: "배송지",
  flowerName: "화환명",
  leftText: "좌측 문구",
  rightText: "우측 문구",
};

const roseKeyMapping = {
  recipientName: "받는고객명",
  telephone: "전화",
  phone: "휴대폰",
  message: "경조사어",
  senderName: "보내는분",
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
export async function ssOrderDataScraper(
  url: string,
  browser: Browser
): Promise<Object> {
  // 삼신 데이터
  let ssData: { [key: string]: string } = {};
  ssData.url = url;
  // TODO: URL로부터 데이터 수집
  const page: Page = await browser.newPage();

  await page.goto(url, { waitUntil: "load" });

  // const rowHeightKeyClass: string[]= ["table-blue", "table-green", "table-gray"]; // 키를 가지고 있는 태그의 클래스 속성

  //데이터 추출
  await page.$$eval(".row-height", (rows) => {
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
          ssData[mappedKey] = value;
        }
      });
    });
  });

  //리본데이터 추출
  await page.$$eval(".inside", (insideTags) => {
    insideTags.forEach((inside) => {
      const keyTags: HTMLElement[] = Array.from(
        inside.querySelectorAll(".row-height, .line-t")
      ).flatMap((element) => {
        return Array.from(
          (element as HTMLElement).querySelectorAll(".table-gray")
        );
      });
      const valueTags: HTMLElement[] = Array.from(
        inside.querySelectorAll(".row-height:not(line-t)")
      ).flatMap((element) => {
        return Array.from(
          (element as HTMLElement).querySelectorAll(".col-height")
        );
      });

      keyTags.forEach((keyTag, index) => {
        const keyInsideElement = keyTag.querySelector(".inside");
        const valueInsideElement = valueTags[index].querySelector(".inside");
        const key: string = keyInsideElement?.textContent?.trim() || "";
        let value: string = valueInsideElement?.textContent?.trim() || "";

        if (value === "") {
          value =
            valueInsideElement?.querySelector("span")?.textContent?.trim() ||
            "";
        }

        // 한글명인 키 영어로 매핑
        const mappedKey = Object.keys(ssKeyMapping).find(
          (k: string) => ssKeyMapping[k as keyof typeof ssKeyMapping] === key
        );
        if (mappedKey) {
          ssData[mappedKey] = value;
        }
      });
    });
  });

  return ssData;
}

export async function roseOrderDataScraper(
  url: string,
  browser: Browser
): Promise<Object> {
  let roseData: { [key: string]: string } = {};
  roseData.url = url;

  const page: Page = await browser.newPage();

  //페이지 이동
  await page.goto(url, { waitUntil: "load" });

  //데이터 추출 , 삼신상사와 다르게 값에 모두 아이디가 존재하여 다른방식으로 추출
  const keyName = {
    arrive_name: "받는고객명",
    arrive_tel: "휴대폰",
    arrive_htel: "전화",
    ribon: "경조사어",
    ribon_card: "보내는분",
  };

  Object.keys(keyName).forEach(async (key) => {
    const tagName = keyName[key as keyof typeof keyName];
    const value = await page.$eval(
      `input[name=${key}]`,
      (input) => (input as HTMLInputElement).value
    );

    const mapped = Object.keys(roseKeyMapping).find(
      (k: string) =>
        roseKeyMapping[k as keyof typeof roseKeyMapping] === tagName
    );

    if (mapped) {
      roseData[mapped] = value;
    }
  });
  return roseData;
}
