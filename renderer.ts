// 페이지 요소 가져오기
const formPage = document.getElementById("formPage") as HTMLDivElement;
const progressPage = document.getElementById("progressPage") as HTMLDivElement;
const consoleOutput = document.getElementById(
  "consoleOutput"
) as HTMLDivElement;

// 페이지 초기화: 입력 폼 표시
formPage.style.display = "flex";

// ✅ 확인 버튼 클릭 이벤트 (폼 데이터 전송)
document.getElementById("submitButton")?.addEventListener("click", () => {
  const data: any = {
    ss: {
      // id: (document.getElementById("ssId") as HTMLInputElement).value,
      // pw: (document.getElementById("ssPw") as HTMLInputElement).value,
      id: "rnm01",
      pw: "young1004@",
    },
    rose: {
      // id: (document.getElementById("roseId") as HTMLInputElement).value,
      // pw: (document.getElementById("rosePw") as HTMLInputElement).value,
      // key: (document.getElementById("roseKey") as HTMLInputElement).value,
      id: "rnm01",
      pw: "1234",
      key: "di699",
    },
    ssRnm: {
      // id: (document.getElementById("ssRnmId") as HTMLInputElement).value,
      // pw: (document.getElementById("ssRnmPw") as HTMLInputElement).value,
      id: "good12",
      pw: "1234",
    },
    roseRnm: {
      // id: (document.getElementById("roseRnmId") as HTMLInputElement).value,
      // pw: (document.getElementById("roseRnmPw") as HTMLInputElement).value,
      id: "rnm1",
      pw: "a2542",
    },
    startDate: (document.getElementById("dateInput") as HTMLInputElement).value,
    stopDate: (document.getElementById("stopDate") as HTMLInputElement).value,
    // time: (document.getElementById("timeInput") as HTMLInputElement).value,
  };

  logMessage(`입력된 데이터: ${JSON.stringify(data)}`);
  logMessage("데이터 입력 완료, 처리 시작...");
  const today = new Date();
  const expireDate = new Date("2025-06-01T00:00:00");
  // if (today >= expireDate) {
  //   logMessage("⛔ 관리자에게 문의 필요");
  //   data.disable = "Y";
  // }
  window.electronAPI.scrapeAndAutoInput(data);
  // 첫 번째 페이지 숨기고 진행 중 페이지 표시
  formPage.style.display = "none";
  progressPage.style.display = "flex";
});
//  종료 버튼 클릭 이벤트 (Electron 앱 종료)
document.getElementById("exitButton")?.addEventListener("click", () => {
  window.electronAPI.stopScrapping(); // Electron 앱 종료 요청
});
window.electronAPI.receiveLogMessage((message) => {
  logMessage(message);
});
window.electronAPI?.onErrorSound(() => {
  console.log("error-sound 수신됨");

  const audio = new Audio("sounds/error.mp3");
  audio.play().catch(() => {
    console.log("소리 재생 실패");
  });
});
//로그 출력
function logMessage(message: string) {
  const logEntry = document.createElement("div");
  logEntry.textContent = `> ${message}`;
  consoleOutput.appendChild(logEntry);
  consoleOutput.scrollTop = consoleOutput.scrollHeight; // 자동 스크롤
}
