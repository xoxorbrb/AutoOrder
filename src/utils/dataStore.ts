export interface DataEntry {
  url: string;
  title: string;
  compName: string;
  userName: string;
  userTel: string;
  userPhone: string;
  address: string;
}

// 데이터 저장소
const dataStore: DataEntry[] = [];
