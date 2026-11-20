import { describe, expect, it } from 'vitest'
import { getEvidenceSummary } from './evidenceUtils'
import { RESEARCH_CASES, researchCaseMetrics } from './researchCases'
import type { Relation } from './data'

const rows = [
  { 청원ID: '3749', 자료명: '회의록', 연결설명: '같은 현안', 자료URL: 'https://council.yongin.go.kr/abc', 연결판정: '같은 사업 직접 언급', 자료유형: '공식 회의록', 주의사항: '완료 증거 아님' },
  { 청원ID: '3749', 자료명: '관련 청원', 연결설명: '반대 입장', 자료URL: 'https://www.yongin.go.kr/abc', 연결판정: '동일 현안 직접 연관', 자료유형: '공식 청원', 주의사항: '' },
  { 청원ID: '3746', 자료명: '다른 자료', 연결설명: '', 자료URL: '', 연결판정: '미확인', 자료유형: '보도자료', 주의사항: '' }
] satisfies Relation[]

describe('petition followup evidence summary', () => {
  it('separates administrative documents from related petitions', () => {
    const result = getEvidenceSummary(rows, '3749')
    expect(result.linked).toHaveLength(2)
    expect(result.administrative).toHaveLength(1)
    expect(result.otherPetitions).toHaveLength(1)
    expect(result.linkedAdministrativeSources).toHaveLength(1)
  })
  it('never counts unrelated petition records', () => {
    expect(getEvidenceSummary(rows, '3746').linked).toHaveLength(1)
    expect(getEvidenceSummary(rows, '0000').linked).toHaveLength(0)
  })
  it('keeps independently reported research cases separate', () => {
    expect(RESEARCH_CASES).toHaveLength(2)
    expect(researchCaseMetrics(RESEARCH_CASES).independentlyVerified).toBe(0)
    expect(RESEARCH_CASES.every(c => c.sourceUrl === null)).toBe(true)
  })
})
