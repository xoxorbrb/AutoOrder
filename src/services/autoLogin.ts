import type { Page } from "puppeteer";
import { sendToLog } from "../autoMain";
const ssUrl: string = "https://samsincall.com/partners/orders/"; //삼신상사
const roseUrl: string = "http://16441644.roseweb.co.kr/index.htm"; // 플라워 인트라넷
const rnmUrl: string = "http://16005423.co.kr/agent/"; // rnm 발주페이지

// 로그인 상태 확인 및 로그인 자동화
export async function sessionCheckAndSetLogin(
  page: Page,
  url: string,
  id: string,
  password: string,
  key: string = "" // 플라워 인트라넷 key 값
): Promise<Boolean> {
  if (url === ssUrl) {
    sendToLog("url: " + url);
    sendToLog("[삼신상사] url 접근");
    // 알림 감지
    let alertOn: Boolean = false;

    page.on("dialog", async (dialog) => {
      sendToLog("[삼신상사] 알림 감지");
      alertOn = true;
      await dialog.dismiss(); // 알럿창 끄기
    });
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });
    if ((alertOn = true)) {
      await page.reload({ waitUntil: "networkidle2" });

      const currentUrl = page.url();

      if (currentUrl.includes("/login")) {
        sendToLog("[삼신상사] 로그인되지 않은 상태, 로그인 필요");
        console.log("현재URL: " + page.url());
        await new Promise((resolve) => setTimeout(resolve, 1000));

        await page.waitForSelector('input[name="member_id"]'); // visible 빼고
        await page.waitForSelector('input[name="member_pw"]');
        await page.focus('input[name="member_id"]');
        await page.type('input[name="member_id"]', id, { delay: 50 });

        await page.focus('input[name="member_pw"]');
        await page.type('input[name="member_pw"]', password, { delay: 50 });

        await Promise.all([
          page.click('input[id="btn-login"]'),
          page.waitForNavigation({ waitUntil: "load" }),
        ]);

        let afterUrl = page.url();

        if (!afterUrl.includes("/login")) {
          sendToLog("[삼신상사] 로그인 성공");
          return true;
        } else {
          sendToLog("[삼신상사] 로그인 실패");
          return false;
        }
      } else {
        sendToLog("[삼신상사] 로그인 되어있음");
        return true;
      }
    }
  } else if (url === roseUrl) {
    page.on("console", (msg) => sendToLog("[플라워 인트라넷] " + msg.text()));
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
    } catch (err: any) {
      sendToLog("[플라워 인트라넷] 페이지 이동 실패: " + err.message);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (page.url().startsWith("chrome-error://")) {
      sendToLog("[플라워 인트라넷] ⚠ SSL 에러 발생 - 수동 넘김 필요");
      sendToLog('[플라워 인트라넷] ⚠ SSL 경고! "고급" → "계속" 눌러주세요.');

      while (true) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const currentUrl = page.url();

        if (!currentUrl.startsWith("chrome-error://")) {
          sendToLog("[플라워 인트라넷] ✅ 정상 페이지 도착");
          break;
        }
        sendToLog('[플라워 인트라넷] ⚠ SSL 경고! "고급" → "계속" 눌러주세요.');
      }
    }

    let loginButtonExists = (await page.$('input[alt="로그인버튼"]')) !== null;

    if (loginButtonExists) {
      sendToLog("[플라워 인트라넷] 로그인 되지 않은 상태");

      await page.evaluate(() => {
        const idField = document.querySelector(
          'input[name="sid"]'
        ) as HTMLInputElement;
        const pwField = document.querySelector(
          'input[name="spw"]'
        ) as HTMLInputElement;
        const keyField = document.querySelector(
          'input[name="skey"]'
        ) as HTMLInputElement;

        //입력필드 초기화
        idField.value = "";
        pwField.value = "";
        keyField.value = "";
      });
      // 로그인 정보 입력
      await page.waitForSelector('input[name="sid"]', { visible: true });
      await page.type('input[name="sid"]', id, { delay: 50 });
      await page.waitForSelector('input[name="spw"]', { visible: true });
      await page.type('input[name="spw"]', password, { delay: 50 });
      await page.waitForSelector('input[name="skey"]', { visible: true });
      await page.type('input[name="skey"]', key, { delay: 50 });

      await new Promise((resolve) => setTimeout(resolve, 5000));
      // await Promise.all([
      //   page.click('input[alt="로그인버튼"]'),
      //   page.waitForNavigation({ waitUntil: "load" }),
      // ]);
      loginButtonExists = (await page.$('input[alt="로그인버튼"]')) === null;

      if (loginButtonExists) {
        sendToLog("[플라워 인트라넷] 로그인 성공");
        return true;
      } else {
        sendToLog("[플라워 인트라넷] 로그인 실패");
        return false;
      }
    }
  } else if (url === rnmUrl) {
    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });
    let loginButtonExists =
      (await page.$("button.btn.btn-primary.btn-block.btn-flat")) !== null;

    if (loginButtonExists) {
      sendToLog("[RNM] 로그인 되어있지 않음");

      await page.evaluate(() => {
        const idField = document.querySelector(
          "input[name=in_uid]"
        ) as HTMLInputElement;
        const pwField = document.querySelector(
          "input[name=in_upw]"
        ) as HTMLInputElement;

        idField.value = "";
        pwField.value = "";
      });
      await page.type('input[name="in_uid"]', id);
      await page.type('input[name="in_upw"]', password);

      await Promise.all([
        page.click("button.btn.btn-primary.btn-block.btn-flat"),
        page.waitForNavigation({ waitUntil: "load" }),
      ]);
      loginButtonExists = (await page.$('input[alt="로그인버튼"]')) === null;

      if (loginButtonExists) {
        sendToLog("[RNM] 로그인 성공");
        return true;
      } else {
        sendToLog("[RNM] 로그인 실패");
        return false;
      }
    }
  }
  return true;
}

//로그아웃 만들기
export async function logoutRNM(page: Page) {
  //로그아웃 url
  page.goto("http://16005423.co.kr/agent/logout.php", { waitUntil: "load" });
}
