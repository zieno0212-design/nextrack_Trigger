export type ResearchCase = {
  id: string
  issue: string
  district: string
  officialResponsePlan: string
  subsequentRecord: string
  documentDate: string
  documentType: string
  directLinkInResponse: boolean
  sourceUrl: string | null
  verification: string
  petitionId?: string
  documentDownload?: string
  documentNumber?: string
  eventDate?: string
  limitation: string
}

// 사용자 제공 조사표 기반. 성복동 건은 원본 공고문을 확보했고 청원 #3972를 별도 등록.
// 신봉동 건은 별도 조사 사례로 유지하며 보도자료 원문 검증 전입니다.
export const RESEARCH_CASES: ResearchCase[] = [
  {
    id: 'RESEARCH-SEONGBOK',
    issue: '성복동 분동 반대',
    district: '수지구',
    officialResponsePlan: '2026년 내 주민설명회 추가 개최',
    subsequentRecord: '2차 주민설명회 개최 공고 확인',
    documentDate: '2026-11-17',
    documentType: '고시공고',
    directLinkInResponse: false,
    sourceUrl: null,
    verification: '공고문 원본 확보 · 공식 답변 본문 미확인',
    petitionId: '3972',
    documentDownload: '/documents/yongin-notice-2026-3182.hwpx',
    documentNumber: '용인시 공고 제2026-3182호',
    eventDate: '2026-12-04',
    limitation: '개최 공고 확인 사실과 실제 주민설명회 개최 완료는 구분해야 합니다.'
  },
  {
    id: 'RESEARCH-SINBONG',
    issue: '신봉동 마을버스 개선',
    district: '수지구',
    officialResponsePlan: '15-5번 버스 1대 증차 계획',
    subsequentRecord: '증차 일정 보도자료 확인',
    documentDate: '2026-07-10',
    documentType: '보도자료',
    directLinkInResponse: false,
    sourceUrl: null,
    verification: '원문 URL 추가 확인 필요',
    limitation: '증차 일정 안내 사실과 실제 증차 운행 개시는 구분해야 합니다.'
  }
]

export function researchCaseMetrics(cases:ResearchCase[]) {
  return {
    examined: cases.length,
    subsequentRecordReported: cases.filter(c=>!!c.subsequentRecord).length,
    noDirectLinkReported: cases.filter(c=>!c.directLinkInResponse).length,
    independentlyVerified: cases.filter(c=>!!c.sourceUrl).length
  }
}
