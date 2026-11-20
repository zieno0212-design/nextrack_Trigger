import {useMemo,useState} from 'react'
import {Search,ExternalLink,Download,ClipboardCheck,FileSearch,Info,ArrowRight,CheckCircle2} from 'lucide-react'
import type {Petition} from './data'
import {findNotices,noticeSuggestions,OFFICIAL_NOTICES,OFFICIAL_NOTICE_LIST,type NoticeCandidate} from './noticeMatcher'

type Decision='pending'|'approved'|'rejected'|'more_evidence'
const KEY='dudream-notice-reviews-v1'
const labels:Record<Decision,string>={pending:'검토 대기',approved:'관련자료 연결 승인(시연)',rejected:'연관 없음(시연)',more_evidence:'근거 추가 필요(시연)'}
function readReviews():Record<string,Decision>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return {}}}
export function NoticeSearch({petitions,onSelectPetition}:{petitions:Petition[],onSelectPetition:(id:string)=>void}){
 const [q,setQ]=useState('')
 const [petitionId,setPetitionId]=useState('3972')
 const [reviews,setReviews]=useState<Record<string,Decision>>(readReviews)
 const [showAll,setShowAll]=useState(false)
 const matched=useMemo(()=>findNotices(q),[q])
 const petition=petitions.find(p=>p.청원ID===petitionId)
 const suggestions=petition?noticeSuggestions(petition):[]
 const notices=showAll?matched:matched.slice(0,10)
 const update=(key:string,value:Decision)=>{const next={...reviews,[key]:value};setReviews(next);localStorage.setItem(KEY,JSON.stringify(next))}
 return <div className="notice-page">
  <section className="panel"><div className="section-heading"><h2><FileSearch size={21}/> 용인시 고시·공고 검색</h2><span className="pill blue">공식 등록문서 1건</span></div>
   <p className="muted">현재 확보·검증한 공고문을 검색합니다. 용인시 전체 공고를 실시간 수집하는 시스템은 아닙니다. 공식 전체 목록은 아래 버튼으로 확인할 수 있습니다.</p>
   <div className="notice-searchbar"><Search size={20}/><input aria-label="고시·공고 검색" placeholder="공고번호, 제목, 동명, 담당부서 입력" value={q} onChange={e=>setQ(e.target.value)}/><button className="outline" onClick={()=>setQ('')}>초기화</button></div>
   <div className="notice-shortcuts"><span>빠른 검색</span>{['2026-3182','성복동','주민설명회','자치분권과'].map(t=><button key={t} onClick={()=>setQ(t)}>{t}</button>)}</div>
   <a href={OFFICIAL_NOTICE_LIST} target="_blank" rel="noopener noreferrer" className="source-link">용인시 공식 고시·공고 전체 검색 열기 <ExternalLink size={15}/></a>
   <div className="notice-found">현재 보유 자료 검색결과 <b>{matched.length}건</b> / 등록 {OFFICIAL_NOTICES.length}건</div>
   {notices.length===0?<div className="notice-empty">해당 조건으로 등록된 공고가 없습니다. 공식 전체 목록에서 검색할 수 있습니다.</div>:notices.map(n=><article className="notice-result" key={n.id}>
    <div className="tag-row"><span className="pill green">공식 공고 원문 확보</span><span className="pill">개별 상세 URL 미확인</span></div>
    <h3>{n.title}</h3><p className="muted">{n.number} · {n.department} · {n.publishedAt} · {n.region}</p><p>{n.summary}</p>
    <div className="notice-actions"><a className="outline" href={n.sourceUrl} target="_blank" rel="noopener noreferrer">공식 목록에서 확인 <ExternalLink size={15}/></a>{n.localDocument&&<a className="primary" href={n.localDocument} download>공고문 원본 다운로드 <Download size={15}/></a>}</div>
   </article>)}
  </section>
  <section className="panel"><div className="section-heading"><h2><ClipboardCheck size={21}/> 청원–공고 자동 추천 및 검토</h2><span className="pill amber">규칙 기반 추천</span></div>
   <p className="muted">청원 지역·사업명·주제어와 확보한 공고문을 비교합니다. 추천 점수는 관계 검토의 우선순위이며 동일 사업일 확률이 아닙니다. 실제 사업 연계는 담당자 검증이 필요합니다.</p>
   <label className="label">분석할 시민청원<select value={petitionId} onChange={e=>setPetitionId(e.target.value)}>{petitions.map(p=><option key={p.청원ID} value={p.청원ID}>#{p.청원ID} {p.청원제목_원문}</option>)}</select></label>
   <p className="notice-count">추천 대상 {suggestions.length}건</p>
   {suggestions.length===0?<div className="notice-empty">현재 확보한 공고문 중 일치하는 후보가 없습니다. 전체 공고를 대상으로 검색한 결과는 아닙니다.</div>:suggestions.map(candidate=><Suggestion key={candidate.notice.id} candidate={candidate} review={reviews[`${petitionId}|${candidate.notice.id}`]||'pending'} onReview={v=>update(`${petitionId}|${candidate.notice.id}`,v)} onSelect={()=>onSelectPetition(petitionId)}/>)}
   <div className="notice-info"><Info size={18}/> 검토 결과는 이 브라우저의 시연 기록이며 행정기관의 공식 승인이나 실제 데이터 수정이 아닙니다. 추후 관리자 로그인 및 서버 승인 기능으로 확장 가능합니다.</div>
  </section>
 </div>
}
function Suggestion({candidate:c,review,onReview,onSelect}:{candidate:NoticeCandidate;review:Decision;onReview:(v:Decision)=>void;onSelect:()=>void}){
 return <div className="notice-suggestion"><div className="section-heading"><strong>{c.notice.title}</strong><span className="notice-score">추천 {c.score}점</span></div>
  <p className="muted">{c.notice.number} · {c.notice.publishedAt}</p>
  <div className="notice-terms">{c.reasons.map(r=><span key={r}>{r}</span>)}</div>
  <p className="notice-review-status"><CheckCircle2 size={15}/> {labels[review]}</p>
  <div className="notice-actions"><button onClick={onSelect} className="outline">청원 상세 확인 <ArrowRight size={15}/></button><a href={c.notice.sourceUrl} target="_blank" rel="noopener noreferrer" className="outline">공고 목록 원문 <ExternalLink size={15}/></a></div>
  <label className="label">검토 기록<select value={review} onChange={e=>onReview(e.target.value as Decision)}>{Object.entries(labels).map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></label>
  <small className="muted">공고 자체의 존재는 확인됐지만 청원으로 인해 공고가 발행됐다는 인과관계는 확인되지 않았습니다.</small>
 </div>
}
export function PetitionNoticeRecommendations({petition}:{petition:Petition}){
 const suggestions=noticeSuggestions(petition)
 if(!suggestions.length) return <div className="notice-inline"><h4>공식 고시·공고 추천</h4><p className="muted">현재 확보한 공식 공고에서 일치 후보가 없습니다. 전체 공고를 검색한 결과는 아닙니다.</p></div>
 return <div className="notice-inline"><h4>공식 고시·공고 관련 후보</h4>{suggestions.map(c=><div className="notice-inline-item" key={c.notice.id}>
 <div className="tag-row"><span className="pill blue">동일 현안 자료 후보</span><span className="pill">추천 {c.score}점 · 추가 검증 필요</span></div><strong>{c.notice.title}</strong><p>{c.reasons.join(' · ')}</p><div className="notice-actions"><a className="source-link" href={c.notice.sourceUrl} target="_blank" rel="noopener noreferrer">용인시 공식 공고 목록 <ExternalLink size={14}/></a>{c.notice.localDocument&&<a className="source-link" href={c.notice.localDocument} download>HWPX 원문 <Download size={14}/></a>}</div>
 </div>)}</div>
}
