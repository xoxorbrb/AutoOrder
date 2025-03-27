import type { Page } from "puppeteer";
import { sendToLog } from "../autoMain";

export async function ssSendInput(data: Record<string, any>, page: Page) {
  page.on("dialog", async (dialog) => {
    console.log("알럿 내용:", dialog.message());
    await dialog.dismiss(); // 또는 dialog.accept();
  });
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve(); // Promise 해결
    }, 1000); // 1초 대기
  });
  // await page.waitForSelector('a[href="balju.html"]', { visible: true });
  // await page.click('a[href="balju.html"]');
  await page.waitForSelector('a[href="/admin/menu02.php"]', { visible: true });
  await page.click('a[href="/admin/menu02.php"]');

  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve(); // Promise 해결
    }, 1000); // 1초 대기
  });

  //드롭다운 상품명 선택
  let flowerName = data.flowerName[0];
  let selectFlower = setSelectFlower(flowerName);

  if (selectFlower) {
    await page.select('select[data-select2-id="ptype"]', selectFlower);
  }

  let count = data.flowerName.length;
  let selectCount = "";

  if (count < 10) {
    selectCount = `0${count.toString()}`;
  }

  //수량
  await page.select('select[data-select2-id="pcnt"]', selectCount);

  //원청금액, 보낼금액 1원으로 통일
  await page.type('input[name="poldwon"]', data.price);
  await page.type('input[name="pwon"]', data.price);

  //주소
  await page.type('input[name="raddr"]', data.deliveryAddress);

  //경조사어
  let leftText = data.leftText
    .map((val: string, index: number) => `${index + 1}. ${val}`)
    .join(" ");
  await page.type('input[name="rgyungjo_1"]', leftText);

  //보내실분 명의
  let rightText = data.rightText
    .map((val: string, index: number) => `${index + 1}. ${val}`)
    .join(" ");
  await page.type('input[name="rsend_1"]', rightText);
}

export async function roseSendInput(data: Record<string, any>, page: Page) {
  await new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve(); // Promise 해결
    }, 1000); // 1초 대기
  });
  await page.click('a[href="balju.html"]');

  const flowerName = data.flowerName?.split(" ").join("");
  let selectFlower = setSelectFlower(flowerName);

  if (selectFlower) {
    await page.select('select[data-select2-id="ptype"]', selectFlower);
  }

  //수량 10 이하일 경우 0 추가
  let count = parseInt(data.count, 10);
  let selectCount = "";

  if (count < 10) {
    selectCount = `0${count.toString()}`;
  }

  //수량
  await page.select('select[data-select2-id="pcnt"]', selectCount);

  //원청금액, 보낼금액 1원으로 통일
  await page.type('input[name="poldwon"]', data.originPrice);
  await page.type('input[name="pwon"]', data.gPrice);

  //주소
  await page.type('input[name="raddr"]', data.arrivePlace);

  //경조사어
  await page.type('input[name="rgyungjo_1"]', data.message);

  //보내는분 명의
  await page.type('input[name="rsend_1"]', data.senderName);
}

function setSelectFlower(flowerName: string): string {
  //정해져있는 값이 없기 때문에 포함되는 경우로 선택해야함.
  //근조 3단 선택 (근조필수, 고급,4단 없음, 일반,기본일경우)
  let selectFlower = "";
  if (
    flowerName?.includes("근조") &&
    !flowerName?.includes("고급") &&
    !flowerName?.includes("4단") &&
    (flowerName?.includes("일반") ||
      flowerName?.includes("기본") ||
      flowerName?.includes("근조3단화환") ||
      flowerName?.includes("근조화환3단"))
  ) {
    selectFlower = "근조3단";
  }
  // 근조3단-고급★★ 선택 (근조, 고급, 3단이 들어가있을경우, 최고급 제외)
  else if (
    flowerName?.includes("근조") &&
    flowerName?.includes("고급") &&
    flowerName?.includes("3단") &&
    !flowerName?.includes("최고급")
  ) {
    selectFlower = "근조3단-고급★★";
  }
  // 근조3단-최고급★★★ 선택 (근조, 최고급, 3단이 들어가있는경우)
  else if (
    flowerName?.includes("근조") &&
    flowerName?.includes("최고급") &&
    flowerName?.includes("3단")
  ) {
    selectFlower = "근조3단-최고급★★★";
  }
  //영정바구니
  else if (flowerName?.includes("근조바구니")) {
    selectFlower = "◎영정바구니";
  }
  //1단오브제
  else if (flowerName === "근조오브제" || flowerName === "오브제1단") {
    selectFlower = "1단오브제";
  }
  //2단오브제
  else if (flowerName?.includes("근조오브제") && flowerName?.includes("2단")) {
    selectFlower = "2단오브제";
  }
  //축하3단
  else if (
    flowerName?.includes("축하") &&
    !flowerName?.includes("고급") &&
    !flowerName?.includes("4단") &&
    (flowerName?.includes("기본") ||
      flowerName?.includes("일반") ||
      flowerName?.includes("축하화환3단") ||
      flowerName === "축하화환")
  ) {
    selectFlower = "축하3단";
  }
  //축하3단-고급★★
  else if (
    flowerName?.includes("고급") &&
    flowerName?.includes("축하") &&
    flowerName?.includes("3단") &&
    !flowerName?.includes("최고급")
  ) {
    selectFlower = "축하3단-고급★★";
  }
  //축하3단-최고급★★★
  else if (
    flowerName?.includes("최초급") &&
    flowerName?.includes("3단") &&
    flowerName?.includes("축하")
  ) {
    selectFlower = "축하3단-최고급★★★";
  } else {
    selectFlower = "상품명확인필요";
  }

  return selectFlower;
}
