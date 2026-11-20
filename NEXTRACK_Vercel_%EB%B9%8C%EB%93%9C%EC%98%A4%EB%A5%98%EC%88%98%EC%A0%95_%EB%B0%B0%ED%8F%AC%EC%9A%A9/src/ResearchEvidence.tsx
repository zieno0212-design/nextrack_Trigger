import { useState } from 'react'
import { ArrowUpRight, ClipboardList, FileSearch, Link2Off } from 'lucide-react'
import { RESEARCH_CASES, researchCaseMetrics } from './researchCases'

export function ResearchEvidence({onBack}:{onBack:()=>void}){
  const [expanded,setExpanded] = useState<string | null>(null)
  const metrics = researchCaseMetrics(RESEARCH_CASES)
  return <div className="research-page">
    <div className="research-intro panel">
      <div className="section-heading"><h2>공식 답변 이후 후속 행정자료 연결 조사</h2><span className="pill blue">계획서 조사표 반영</span></div>
      <p>공식 답변 이후 후속 조치와 관련된 행정자료가 별도로 안내된 두 사례를 비교했습니다. 원본 청원 답변에 후속자료 직접 링크가 있었는지와, 별도의 자료를 통해 후속 내용을 확인했는지를 나누어 보여줍니다.</p>
      <p className="research-source-note">자료 기준: 제공된 공모전 계획서 조사표. 성복동 2차 주민설명회 공고문(용인시 공고 제2026-3182호)의 원본 파일은 확보했습니다. 신봉동 보도자료는 원문 URL을 추가 확인해야 합니다. 성복동 청원 #3972는 기존 10건에 별도로 추가 등록했습니다.</p>
    </div>
    <div className="research-metrics">
      <div><ClipboardList size={19}/><span>조사 사례</span><strong>{metrics.examined}건</strong></div>
      <div><FileSearch size={19}/><span>후속자료 확인 기록</span><strong>{metrics.subsequentRecordReported}건</strong></div>
      <div><Link2Off size={19}/><span>답변 내 직접 링크 없음(조사표 기록)</span><strong>{metrics.noDirectLinkReported}건</strong></div>
    </div>
    <section className="panel">
      <div className="section-heading"><h2>사례별 정보 연결 현황</h2><span className="pill amber">자료별 검증 수준 구분</span></div>
      <div className="research-table-scroll"><table className="research-table"><thead><tr><th>지역 및 현안</th><th>공식 답변상 후속 계획</th><th>별도 행정자료 확인 현황</th><th>답변 내 직접 연결</th></tr></thead><tbody>
        {RESEARCH_CASES.map(c=><tr key={c.id}><td><b>{c.issue}</b><span>{c.district}</span></td><td>{c.officialResponsePlan}</td><td><b>{c.documentDate}</b><p>{c.subsequentRecord} · {c.documentType}</p></td><td><span className="pill">{c.petitionId==='3972' ? '본문 미확보 · 직접 연결 미확인' : '없음 (조사표 기록)'}</span></td></tr>)}
      </tbody></table></div>
      <p className="research-footnote">* ‘직접 링크 없음’은 제공된 조사표에 기록된 조사 결과입니다. #3972의 공식 답변 본문은 아직 확보하지 못했으므로 직접 연결 여부도 확정하지 않습니다.</p>
    </section>
    <section className="research-case-grid">
      {RESEARCH_CASES.map(c=><article className="panel" key={c.id}>
        <div className="section-heading"><h3>{c.issue}</h3><span className="pill">{c.district}</span></div>
        <div className="research-flow"><div><small>공식 답변의 계획</small><p>{c.officialResponsePlan}</p></div><span aria-hidden="true">→</span><div><small>별도 확인된 행정자료 기록</small><p>{c.documentDate} · {c.subsequentRecord}</p></div></div>
        <p className="research-limitation">{c.limitation}</p>
        <button className="outline" onClick={()=>setExpanded(expanded===c.id?null:c.id)} aria-expanded={expanded===c.id}>{expanded===c.id?'검증 안내 접기':'출처 검증 안내 보기'} <ArrowUpRight size={14}/></button>
        {expanded===c.id&&<div className="research-verification"><strong>원문 검증 필요</strong><p>{c.documentDownload ? '제공된 용인시 공고문 원본 파일을 확보했습니다. 청원 공식 답변 본문과 직접 연결 여부는 미확인입니다.' : '해당 보도자료의 원문 URL, 발행 주체, 문서 제목을 추가 확인해야 합니다.'}</p></div>}
      </article>)}
    </section>
    <section className="panel research-conclusion"><h2>분석 결과</h2>
      <p>제공된 조사표에는 두 사례 모두 공식 답변 이후 관련 행정자료가 별도로 공개된 것으로 기록되어 있습니다. 성복동 사례는 2026.11.17.자 공고문 원본을 추가 확보했습니다. 다만 #3972 공식 답변의 본문을 확보하지 못했으므로 청원에서 공고로 직접 연결되는지 확정할 수 없습니다.</p>
      <p>이는 후속 행정정보가 공개되더라도 시민이 최초 청원과 이후 추진 경과를 따로 검색해야 할 수 있음을 보여주는 사례입니다. 다만 두 사례만으로 전체 청원 시스템의 정보 연계 수준을 일반화할 수는 없습니다.</p>
      <div className="research-action"><strong>NEXTRACK 적용 방안</strong><p>청원 상세 페이지에 ‘후속 행정자료’ 영역을 두고, 답변·공고·보도자료를 검증된 원문 링크로 연결합니다. AI가 찾은 후보 자료는 담당자의 확인 전까지 추천 상태로 구분합니다.</p></div>
      <button className="outline" onClick={onBack}>대시보드로 돌아가기</button>
    </section>
  </div>
}
