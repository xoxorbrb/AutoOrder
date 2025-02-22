import puppeteer, { Browser, Page } from "puppeteer";

const ssKeyMapping = {
  orderNum: "주문번호",
  customerName: "고객명",
  phone: "휴대폰1/휴대폰2",
  telephone: "유선전화",
  deliveryAddress: "배송지",
  flowerName: "화환명",
  leftText: "좌측 문구",
  rightText: "우측 문구",
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

  await page.goto(url, { waitUntil: "networkidle2" });

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
