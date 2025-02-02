import * as ExcelJS from "exceljs";
import fs from "fs";
import { DataEntry } from "./dataStore";
export async function saveToExcel(data: DataEntry[], filePath: string) {
  const workbook = new ExcelJS.Workbook();

  let workSheet;

  //시트 추가
  if (fs.existsSync(filePath)) {
    await workbook.xlsx.readFile(filePath);
    workSheet = workbook.getWorksheet("발주 데이터");
  } else {
    workSheet = workbook.addWorksheet("발주 데이터");
    //컬럼 추가
    workSheet.columns = [
      { header: "URL", key: "url", width: 50 },
      { header: "제목", key: "title", width: 50 },
      { header: "회사명", key: "compName", width: 50 },
      { header: "받는 분 성명", key: "userName", width: 50 },
      { header: "휴대번호", key: "userPhone", width: 100 },
      { header: "전화번호", key: "userTel", width: 100 },
      { header: "주소", key: "address", width: 200 },
    ];
  }

  if (!workSheet) {
    return;
  }

  //DataEntry 데이터 추가
  data.forEach((entry: DataEntry) => workSheet.addRow(entry));

  //엑셀 파일을 메모리 버퍼로 변환
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
}
