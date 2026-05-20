// D-day 계산 순수 유틸 — KST(Asia/Seoul) 기준 자정, DST 없음

// KST는 DST가 없으므로 UTC 일자 시프트가 KST 일자 시프트와 1:1 대응
export function shiftDateKst(yyyyMmDd: string, deltaDays: number): string {
  const [y, m, d] = yyyyMmDd.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + deltaDays);
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// 오늘 날짜를 KST 기준 YYYY-MM-DD로 반환
function todayKst(today: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(today);
}

// 양수: D-N(선거 전), 0: D-DAY, 음수: 선거 종료
export function calculateDday(electionDay: string, today?: Date): number {
  const baseToday = today ?? new Date();
  const todayStr = todayKst(baseToday);
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const [ey, em, ed] = electionDay.split('-').map(Number);
  const todayUtc = Date.UTC(ty, tm - 1, td);
  const electionUtc = Date.UTC(ey, em - 1, ed);
  return Math.round((electionUtc - todayUtc) / (1000 * 60 * 60 * 24));
}

// "D-7" / "D-DAY" / "D+1"
export function formatDdayLabel(dday: number): string {
  if (dday > 0) return `D-${dday}`;
  if (dday === 0) return 'D-DAY';
  return `D+${Math.abs(dday)}`;
}
