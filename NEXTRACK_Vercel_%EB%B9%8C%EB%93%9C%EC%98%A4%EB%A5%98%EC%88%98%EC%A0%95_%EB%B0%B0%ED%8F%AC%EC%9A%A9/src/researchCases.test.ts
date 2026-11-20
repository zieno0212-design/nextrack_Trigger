import { describe, expect, it } from 'vitest'
import { RESEARCH_CASES, researchCaseMetrics } from './researchCases'

describe('제공 조사표 기반 후속행정자료 사례', () => {
 it('2개 사례를 실제 청원 10건 통계와 별도로 보관한다', () => {
  expect(RESEARCH_CASES).toHaveLength(2)
  expect(RESEARCH_CASES.every(c=>c.id.startsWith('RESEARCH-'))).toBe(true)
 })
 it('직접 링크 없음과 행정조치 미실행을 혼동하지 않는다', () => {
  const m=researchCaseMetrics(RESEARCH_CASES)
  expect(m.noDirectLinkReported).toBe(2)
  expect(m.subsequentRecordReported).toBe(2)
  expect(m.independentlyVerified).toBe(0) // 공식 게시 URL 확보 건수; 성복동 HWPX 원본은 별도 보관
 })
 it('원문 URL을 만들어내지 않는다', () => {
  expect(RESEARCH_CASES.every(c=>c.sourceUrl===null)).toBe(true)
 })
})
