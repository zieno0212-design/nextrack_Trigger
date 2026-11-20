import { SeongbokEvidence } from './SeongbokEvidence'
import { useState } from 'react'
import { ArrowRight, ExternalLink, FileSearch, Link2, Link2Off } from 'lucide-react'
import type { Petition, Relation } from './data'
import { RESEARCH_CASES, type ResearchCase } from './researchCases'
import { getEvidenceSummary } from './evidenceUtils'

const validUrl = (url: string | null | undefined) => !!url && /^https:\/\//i.test(url)

export function PetitionFollowupAssessment({ petition, relations, onViewResearch }: {
  petition: Petition
  relations: Relation[]
  onViewResearch: (id: string) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const { linked, administrative, otherPetitions, linkedAdministrativeSources: availableSources } = getEvidenceSummary(relations, petition.청원ID)
  return <section className="followup-assessment" aria-label="후속 행정자료 연결 분석">
    <div className="section-heading"><h4>후속 행정자료 연결 분석</h4><span className="pill blue">실제 청원별 자료 점검</span></div>
    <div className="followup-assessment-stats">
      <div><small>연계 레코드</small><strong>{linked.length}건</strong></div>
      <div><small>행정자료 후보</small><strong>{administrative.length}건</strong></div>
      <div><small>관련 청원</small><strong>{otherPetitions.length}건</strong></div>
    </div>
    <div className="followup-evidence-row"><span>후속자료 원문 링크</span><strong>{availableSources.length ? `${availableSources.length}건 확인 가능` : '연결된 자료 없음'}</strong></div>
    <div className="followup-evidence-row"><span>최초 공식 답변에 후속자료 직접 링크</span><strong>별도 대조 필요</strong></div>
    <div className="followup-evidence-row"><span>실제 행정조치 완료 여부</span><strong>후속정보 미확인</strong></div>
    <p className="followup-evidence-note">CSV의 자료 연결은 해당 청원과 관련된 근거·후보를 보여주는 기록입니다. 원본 답변 내 직접 링크 유무와 실제 사업의 시행·완료 여부는 별도로 검증해야 합니다.</p>
    {administrative.length > 0 && <div className="followup-evidence-items">
      {administrative.map((r, i) => <div key={`${r.청원ID}-${i}`}>
        <div className="tag-row"><span className="pill">{r.자료유형}</span><span className="pill amber">{r.연결판정}</span></div>
        <strong>{r.자료명}</strong><p>{r.연결설명}</p>
        {r.주의사항 && <small>{r.주의사항}</small>}
        {validUrl(r.자료URL) && <a className="source-link" href={r.자료URL} target="_blank" rel="noreferrer">근거 원문 보기 <ExternalLink size={13}/></a>}
      </div>)}
    </div>}
    <button className="outline followup-toggle" onClick={() => setExpanded(v => !v)} aria-expanded={expanded}>
      {expanded ? '별도 조사 사례 접기' : '후속자료 연결 실증 사례 함께 보기'} <ArrowRight size={14}/>
    </button>
    {expanded && <div className="followup-independent-cases">
      <p className="muted tiny">다음 사례는 현재 선택한 청원과 연결된 행정자료가 아닙니다. 공모전 조사표의 별도 사례이며, 원문 URL을 통한 독립 검증 전입니다.</p>
      {RESEARCH_CASES.map(c => <button key={c.id} onClick={() => onViewResearch(c.id)} className="followup-case-link">
        <span><b>{c.issue}</b><small>{c.documentDate} · {c.documentType}</small></span><ArrowRight size={15}/>
      </button>)}
    </div>}
  </section>
}

export function ResearchCaseDetail({ researchCase, onBack }: {
  researchCase: ResearchCase
  onBack: () => void
}) {
  return <section id="research-case-detail" className="panel detail" aria-label="후속자료 실증 조사 사례 상세">
    <div className="section-heading"><h2>후속자료 실증 사례 상세</h2><span className="pill amber">조사표 기반 · 출처 재확인 필요</span></div>
    <h3>{researchCase.issue}</h3>
    <dl className="facts"><div><dt>지역</dt><dd>{researchCase.district}</dd></div><div><dt>자료 유형</dt><dd>{researchCase.documentType}</dd></div></dl>
    <div className="followup-path" aria-label="공식 답변과 별도 후속자료">
      <div><small>공식 답변에 기재된 계획</small><p>{researchCase.officialResponsePlan}</p></div>
      <ArrowRight size={20}/>
      <div><small>별도 행정자료 확인 기록</small><p>{researchCase.documentDate} · {researchCase.subsequentRecord}</p></div>
    </div>
    <div className="followup-evidence-row"><span>공식 답변에서 후속자료로 직접 연결</span><strong>{researchCase.directLinkInResponse ? '있음' : '없음 (조사표 기준)'}</strong></div>
    <div className="followup-evidence-row"><span>공식 공고문 원본</span><strong>{researchCase.documentDownload ? '첨부파일 확보' : researchCase.sourceUrl ? '게시 URL 확보' : '미확보'}</strong></div>
    <div className="followup-evidence-row"><span>자료 검증 수준</span><strong>{researchCase.verification}</strong></div>
    <div className="info-area"><h4>판단 시 유의사항</h4><p>{researchCase.limitation}</p><p className="muted tiny">조사표의 행정자료 확인 기록을 반영한 것이며, 해당 행정조치가 완료됐다는 의미는 아닙니다.</p></div>
    {researchCase.documentDownload && <a className="source-link" href={researchCase.documentDownload} download>공식 공고문 다운로드 (.hwpx) <ExternalLink size={13}/></a>}
    {researchCase.sourceUrl ? <a className="source-link" href={researchCase.sourceUrl} target="_blank" rel="noreferrer">공식 원문 확인 <ExternalLink size={13}/></a> : <div className="followup-evidence-note"><FileSearch size={16}/> 공식 게시 URL은 미확보입니다. 첨부 공고문 원본 파일은 별도로 다운로드할 수 있습니다.</div>}
    {researchCase.petitionId==='3972' && <SeongbokEvidence/>}
    <div className="info-area"><h4>NEXTRACK의 개선 지점</h4><p>공식 답변과 이후 공개되는 행정자료를 하나의 현안 상세 화면에서 연결하면 시민의 후속 경과 탐색 부담을 줄일 수 있습니다. 실제 운영 시에는 원문 출처와 연결 검증 결과를 함께 공개합니다.</p></div>
    <button className="outline" onClick={onBack}>청원 목록으로 돌아가기</button>
  </section>
}

export function ResearchCasesChooser({ onSelect }: { onSelect: (id: string) => void }) {
  return <section className="panel research-mini-picker">
    <div className="section-heading"><h2>후속 행정자료 연결 실증 사례</h2><span className="pill amber">성복동 #3972 연결 · 신봉동 별도 조사</span></div>
    <p className="muted">공모전 조사표의 성복동·신봉동 사례를 같은 상세조회 화면에서 비교합니다. 성복동 청원 #3972를 추가 등록해 원본 공고문과 연결했습니다. 신봉동은 별도 조사 사례로 남겨둡니다.</p>
    <div className="research-mini-grid">{RESEARCH_CASES.map(c => <button key={c.id} onClick={() => onSelect(c.id)}>
      <span className="research-mini-icon">{c.documentType === '고시공고' ? <Link2Off size={20}/> : <Link2 size={20}/>}</span>
      <strong>{c.issue}</strong><small>{c.documentDate} · {c.subsequentRecord}</small><span className="research-mini-open">조사 사례 상세 보기 <ArrowRight size={14}/></span>
    </button>)}</div>
  </section>
}
