import { ArrowRight, Download, ExternalLink, FileCheck2, FileQuestion, Link2, CalendarDays } from 'lucide-react'

export const SEONGBOK_PETITION_ID = '3972'
export const SEONGBOK_URL = 'https://www.yongin.go.kr/citizen/ctznPetit/BD_selectCtznPetit.do?q_petitSn=3972'
export const NOTICE_PATH = '/documents/yongin-notice-2026-3182.hwpx'

export const SEONGBOK_EVENTS = [
  { date:'2026-09-21', title:'분동 반대 시민청원 접수', detail:'청원 #3972 · 성복동 분동을 반대합니다.', type:'petition', verified:true },
  { date:'2026-10-21', title:'청원 기간 종료', detail:'공식 페이지에 표시된 마감일. 답변완료 상태는 확인했지만 답변 게시일과 본문은 미확보.', type:'petition', verified:true },
  { date:'2026-11-17', title:'용인시 주민설명회(2차) 개최 공고', detail:'용인시 공고 제2026-3182호 · 설문조사 결과 안내 및 추가 주민의견 청취 계획.', type:'document', verified:true },
  { date:'2026-12-04', title:'2차 주민설명회 개최 예정', detail:'10:00 · 성복동 행정복지센터 대회의실(2층). 공고상 예정일로, 실제 개최 여부는 미확인.', type:'scheduled', verified:false }
] as const

export function SeongbokEvidence(){
 return <section className="seongbok-evidence" aria-label="성복동 분동 관련 공식 청원과 후속 행정자료">
  <div className="section-heading"><h4>성복동 분동 · 청원–행정자료 연결 추적</h4><span className="pill blue">원본 공고문 확보</span></div>
  <p className="muted">청원 #3972와 용인시 공고 제2026-3182호가 같은 현안을 다룬다는 점을 확인했습니다. 다만 공고문에는 청원 번호가 없어 직접적인 청원 후속조치로 확정할 수 없습니다.</p>
  <div className="seongbok-connection" aria-label="행정자료 연결 구조">
   <div className="seongbok-node"><small>시민청원 · 공식 화면 확인</small><b>#3972 성복동 분동 반대</b><span className="pill blue">답변완료 표시 확인</span><a href={SEONGBOK_URL} target="_blank" rel="noreferrer">청원 원문 <ExternalLink size={13}/></a></div>
   <div className="seongbok-link-edge"><Link2 size={19}/><span>동일 현안 연관</span><small>청원 직접 연계 미확인</small><ArrowRight size={19}/></div>
   <div className="seongbok-node"><small>공식 공고 · 원본 문서 확보</small><b>제2026-3182호 2차 주민설명회 공고</b><span className="pill amber">2026.12.04. 개최 예정</span><a href={NOTICE_PATH} download>공고문 HWPX 받기 <Download size={13}/></a></div>
  </div>
  <div className="seongbok-two-col">
   <section><h5><CalendarDays size={17}/> 날짜별 추진·확인 이력</h5><ol className="seongbok-timeline">{SEONGBOK_EVENTS.map(ev=><li key={ev.date} className={ev.verified?'':'seongbok-future'}><time dateTime={ev.date}>{ev.date}</time><strong>{ev.title}</strong><p>{ev.detail}</p></li>)}</ol></section>
   <section><h5><FileCheck2 size={17}/> 공문서 근거와 검증 결과</h5><div className="seongbok-fact"><b>공고문</b><span>용인시 공고 제2026-3182호 (2026.11.17.)</span></div><div className="seongbok-fact"><b>공고 내용</b><span>설문조사 결과 안내·추가 주민의견 청취</span></div><div className="seongbok-fact"><b>일정·장소</b><span>2026.12.04.(금) 10:00, 성복동 행정복지센터 2층 대회의실</span></div><div className="seongbok-fact"><b>답변 원문</b><span>공식 답변완료 상태만 확인 · 답변 본문/답변일 추가 확인 필요</span></div><div className="seongbok-fact"><b>직접 연계</b><span>공고문에 청원 #3972 명시되지 않음</span></div><div className="seongbok-fact"><b>사업 완료</b><span>분동 결정 및 설명회 실제 개최 여부 확인되지 않음</span></div><a className="seongbok-download" href={NOTICE_PATH} download><Download size={16}/> 첨부 공식 공고문 다운로드 (.hwpx)</a><div className="seongbok-caution"><FileQuestion size={17}/><span>자료 연결은 동일 현안에 대한 연관성을 뜻합니다. 청원에 대한 직접 처리 결과나 정책 수용을 입증하지 않습니다.</span></div></section>
  </div>
 </section>
}
