import { SeongbokEvidence, SEONGBOK_PETITION_ID } from './SeongbokEvidence'
import {useEffect,useMemo,useState} from 'react'
import {MapContainer,TileLayer,Marker,Popup,Tooltip} from 'react-leaflet'
import L from 'leaflet'
import {BarChart3,MapPinned,FileText,GitMerge,GitBranch,Search,ExternalLink,ChevronRight,BookOpen,CheckCircle2,ClipboardList,CalendarDays} from 'lucide-react'
import {district,loadData,similarity,type Petition,type Relation,type Summary} from './data'
import {IssueExplorer,DocumentReview,EvidenceDashboard,ParticipationDemo} from './Features'
import {ResearchEvidence} from './ResearchEvidence'
import { PetitionFollowupAssessment, ResearchCaseDetail, ResearchCasesChooser } from './FollowupEvidence'
import { RESEARCH_CASES } from './researchCases'
import { NoticeSearch, PetitionNoticeRecommendations } from './NoticeSearch'
import { TrackingWorkspace, TrackingDetail } from './TrackingWorkspace'
import { RegionalWorkspace } from './RegionalWorkspace'
import { NeighborhoodHub } from './NeighborhoodHub'

type View='hub'|'regional'|'tracker'|'dashboard'|'map'|'petitions'|'similar'|'issues'|'documents'|'accountability'|'participation'|'research'|'notices'
type Policy={id:string;title:string;petitionIds:string[];stage:number;description:string}
type Change={policyId:string;from:number;to:number;reason:string;when:string}
const STAGES=['사업연계 확인 전','관련 사업 검토','추진계획 수립','조치·사업 수행','결과 검증·공개']
const INITIAL_POLICIES:Policy[]=[
  {id:'DEMO-P1',title:'동천배수지 파크골프장 관련 시민의견 검토',petitionIds:['3749','3746'],stage:0,description:'동일 현안에 관한 찬반 청원 연결을 보여주는 가상 사업 추적 시연입니다.'},
  {id:'DEMO-P2',title:'도담마을·죽전역 버스 연계 개선 검토',petitionIds:['3952','3943'],stage:0,description:'관련 교통 청원 간 연결과 단계 변경 이력을 보여주는 시연입니다.'}
]
function readLocal<T>(key:string,fallback:T):T {try{const s=localStorage.getItem(key);return s?JSON.parse(s) as T:fallback}catch{return fallback}}
const summaryNumber=(s:Summary[],metric:string)=>s.find(x=>x.지표===metric)?.건수
const LinkOut=({href,children}:{href:string,children:React.ReactNode})=> href?.startsWith('https://')?<a href={href} target="_blank" rel="noreferrer" className="source-link">{children} <ExternalLink size={13}/></a>:<span className="muted">원문 주소 없음</span>
function Pill({children,variant='gray'}:{children:React.ReactNode,variant?:'gray'|'blue'|'green'|'amber'}){return <span className={'pill '+variant}>{children}</span>}
function Metrics({items}:{items:{label:string;value:number|string;note?:string}[]}){return <div className="metrics">{items.map(m=><div className="metric" key={m.label}><div className="muted">{m.label}</div><strong>{m.value}</strong>{m.note&&<small className="muted">{m.note}</small>}</div>)}</div>}
function PetitionDetail({petition,relations,onSelect,onViewResearch}:{petition:Petition,relations:Relation[],onSelect:(id:string)=>void,onViewResearch:(id:string)=>void}){
 const linked=relations.filter(r=>r.청원ID===petition.청원ID)
 const siblings=petition.유사청원ID.split(/[;,\s]+/).filter(Boolean)
 return <section className="panel detail" aria-label="선택한 청원 상세"><div className="section-heading"><h2>청원 상세</h2><Pill>청원 #{petition.청원ID}</Pill></div><h3>{petition.청원제목_원문}</h3><div className="tag-row"><Pill variant="blue">공식 {petition.공식청원상태}</Pill><Pill>후속정보 미확인</Pill></div>
 <dl className="facts"><div><dt>지역</dt><dd>{petition.지역_청원내용기반}</dd></div><div><dt>분야</dt><dd>{petition.분야}</dd></div><div><dt>청원기간</dt><dd>{petition.청원시작일} ~ {petition.청원마감일}</dd></div><div><dt>참여인원</dt><dd>{petition.참여인원||'미확인'}</dd></div></dl>
 <div className="info-area"><h4>공식 답변 요약</h4><p>{petition.공식답변_핵심요약||'답변 요약이 제공되지 않았습니다.'}</p></div>
 <div className="info-area"><h4>후속 검증 과제</h4><p>{petition.후속_검증과제||'후속 조치 정보 확인이 필요합니다.'}</p><p className="muted tiny">이첩 여부: {petition.이첩여부_확인결과||'확인되지 않음'}</p></div>
 <LinkOut href={petition.원본URL}>용인시 공식 청원 확인</LinkOut>
 <TrackingDetail petition={petition}/>
 <PetitionFollowupAssessment petition={petition} relations={relations} onViewResearch={onViewResearch}/><PetitionNoticeRecommendations petition={petition}/>
 {petition.청원ID===SEONGBOK_PETITION_ID&&<SeongbokEvidence/>}
 <h4 className="subheading">관련 청원</h4>{siblings.length?siblings.map(id=><button className="relation-nav" key={id} onClick={()=>onSelect(id)}>청원 #{id} 상세 보기 <ChevronRight size={15}/></button>):<p className="muted">연결된 청원 ID 없음</p>}
 <h4 className="subheading">관련 행정자료·연관 청원 ({linked.length})</h4>{linked.length?linked.map((r,i)=><div className="related" key={`${r.자료URL}-${i}`}><div className="tag-row"><Pill variant="amber">{r.자료유형}</Pill><Pill>{r.연결판정}</Pill></div><strong>{r.자료명}</strong><p>{r.연결설명}</p>{r.주의사항&&<p className="muted tiny">주의: {r.주의사항}</p>}{r.자료URL.startsWith('/documents/') ? <a className="source-link" href={r.자료URL} download>첨부 공고문 다운로드</a> : <LinkOut href={r.자료URL}>원본 자료 보기</LinkOut>}</div>):<p className="muted">연결 자료가 확인되지 않았습니다.</p>}
 </section>
}
type DemoStatus='검토 중'|'조치 중'|'조치 완료'
type DemoIssue={id:string;title:string;district:string;neighborhood:string;position:[number,number];status:DemoStatus;description:string}
// 시연용 가상 현안 및 지도 예시 좌표입니다. 실제 청원 발생 위치나 공식 행정 상태가 아닙니다.
const DEMO_ISSUES:DemoIssue[]=[
 {id:'MAP-D01',title:'동천동 버스 노선 개선 요청',district:'수지구',neighborhood:'동천동',position:[37.3385,127.097],status:'조치 중',description:'버스 노선 개선 검토를 가정한 가상 현안입니다.'},
 {id:'MAP-D02',title:'죽전동 통학로 개선 요청',district:'수지구',neighborhood:'죽전동',position:[37.324,127.111],status:'검토 중',description:'통학로 개선 검토를 가정한 가상 현안입니다.'},
 {id:'MAP-D03',title:'상현동 보행 안전시설 개선',district:'수지구',neighborhood:'상현동',position:[37.303,127.081],status:'조치 완료',description:'보행 안전시설 개선 완료를 가정한 가상 현안입니다.'},
 {id:'MAP-D04',title:'보정동 교통환경 개선',district:'기흥구',neighborhood:'보정동',position:[37.318,127.113],status:'조치 완료',description:'교통환경 개선 완료를 가정한 가상 현안입니다.'},
 {id:'MAP-D05',title:'동백동 생활환경 개선',district:'기흥구',neighborhood:'동백동',position:[37.275,127.149],status:'검토 중',description:'생활환경 개선 검토를 가정한 가상 현안입니다.'},
 {id:'MAP-D06',title:'역북동 보행환경 개선',district:'처인구',neighborhood:'역북동',position:[37.239,127.210],status:'조치 중',description:'보행환경 개선 작업을 가정한 가상 현안입니다.'},
 {id:'MAP-D07',title:'모현읍 도로 안전 개선',district:'처인구',neighborhood:'모현읍',position:[37.300,127.234],status:'검토 중',description:'도로 안전 개선 검토를 가정한 가상 현안입니다.'}
]
const DEMO_STATUS_COLORS:Record<DemoStatus,string>={'검토 중':'#e99512','조치 중':'#2675e8','조치 완료':'#1a9f66'}
function demoMarkerIcon(status:DemoStatus){
 const color=DEMO_STATUS_COLORS[status]
 return L.divIcon({className:'dudream-pin-wrap',html:`<div class="dudream-map-pin dudream-map-pin-labeled" style="--pin-color:${color}"><span>${status.replace(' ','')}</span></div>`,iconSize:[62,54],iconAnchor:[31,51],popupAnchor:[0,-48]})
}
function RegionMap({petitions,onSelect}:{petitions:Petition[],onSelect:(id:string)=>void}){
 const [showDemo,setShowDemo]=useState(true)
 const [statuses,setStatuses]=useState<DemoStatus[]>(['검토 중','조치 중','조치 완료'])
 const [demoDistrict,setDemoDistrict]=useState('전체')
 const [activeDemo,setActiveDemo]=useState<DemoIssue|null>(null)
 const grouped=['수지구','기흥구','처인구','지역 확인 필요'].map(d=>({district:d,petitions:petitions.filter(p=>district(p)===d)}))
 const visibleDemo=DEMO_ISSUES.filter(x=>showDemo&&statuses.includes(x.status)&&(demoDistrict==='전체'||demoDistrict===x.district))
 function toggleStatus(s:DemoStatus){setStatuses(prev=>prev.includes(s)?prev.filter(v=>v!==s):[...prev,s])}
 return <div className="map-layout">
  <div className="map-column">
   <div className="map-demo-toolbar">
    <label><input type="checkbox" checked={showDemo} onChange={e=>{setShowDemo(e.target.checked);setActiveDemo(null)}}/> 시연용 현안 마커 표시</label>
    <select aria-label="지도 시연 지역" value={demoDistrict} onChange={e=>setDemoDistrict(e.target.value)}><option>전체</option>{['수지구','기흥구','처인구'].map(g=><option key={g}>{g}</option>)}</select>
    <span className="muted tiny">가상 현안 {visibleDemo.length}건</span>
   </div>
   <div className="map-status-toolbar" aria-label="지도 시연 상태 필터">{(Object.keys(DEMO_STATUS_COLORS) as DemoStatus[]).map(s=><label key={s}><input type="checkbox" checked={statuses.includes(s)} onChange={()=>toggleStatus(s)}/><i style={{background:DEMO_STATUS_COLORS[s]}}/>{s}</label>)}</div>
   <div className="map-canvas">
    <MapContainer center={[37.29,127.15]} zoom={11} scrollWheelZoom={true} style={{height:'100%',width:'100%'}}>
     <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"/>
     {visibleDemo.map(issue=><Marker key={issue.id} position={issue.position} icon={demoMarkerIcon(issue.status)} eventHandlers={{click:()=>setActiveDemo(issue)}}>
       <Tooltip direction="top" offset={[0,-28]}>{issue.title} · 가상</Tooltip>
       <Popup><div className="demo-popup"><strong>{issue.title}</strong><p>시연용 가상 현안 / {issue.district} {issue.neighborhood}</p><p><b>가상 상태:</b> {issue.status}</p><p>{issue.description}</p><small>실제 시민청원이나 행정조치 자료가 아닙니다.</small></div></Popup>
     </Marker>)}
    </MapContainer>
    <div className="map-demo-watermark">공모전 시연용 가상 마커 · 실제 청원 위치 아님</div>
   </div>
   {activeDemo&&<div className="demo-selected"><div><strong>{activeDemo.title}</strong><p>{activeDemo.district} {activeDemo.neighborhood} · 가상 상태: {activeDemo.status}</p><small>{activeDemo.description}</small></div><button className="outline" onClick={()=>setActiveDemo(null)}>닫기</button></div>}
   <div className="map-real-notice"><MapPinned size={17}/><span>아래 실제 청원 10건은 지역별 목록에서 조회합니다. 정확한 위치 좌표가 검증되지 않아 실제 청원 마커는 표시하지 않았습니다.</span></div>
  </div>
  <div className="region-list"><h3>실제 공개 청원 목록 <Pill variant="blue">{petitions.length}건</Pill></h3>{grouped.map(g=><div key={g.district} className="region-group"><h4>{g.district} <span>{g.petitions.length}건</span></h4>{g.petitions.map(p=><button key={p.청원ID} onClick={()=>onSelect(p.청원ID)}><span><small>#{p.청원ID} · 후속정보 미확인</small><br/>{p.청원제목_원문}</span><ChevronRight size={14}/></button>)}</div>)}</div>
 </div>
}

function Similar({petitions,onSelect}:{petitions:Petition[],onSelect:(id:string)=>void}){
 const [focus,setFocus]=useState('3749')
 const target=petitions.find(p=>p.청원ID===focus)||petitions[0]
 const suggestions=useMemo(()=>target?petitions.filter(p=>p.청원ID!==target.청원ID).map(p=>({p,...similarity(target,p)})).sort((a,b)=>Number(b.explicit)-Number(a.explicit)||b.score-a.score):[],[petitions,target])
 if(!target)return null
 return <div className="page-grid"><section className="panel"><div className="section-heading"><h2>유사·반복 청원 분석</h2><Pill variant="amber">규칙 기반 추천</Pill></div><p className="muted">이 분석은 실제 AI 임베딩 모델이 아니라 설명 가능한 키워드·지역·기존 링크 기반 추천입니다. 유사도는 동일 사업 확률이 아닙니다.</p><label className="label">기준 청원 선택<select value={focus} onChange={e=>setFocus(e.target.value)}>{petitions.map(p=><option key={p.청원ID} value={p.청원ID}>#{p.청원ID} {p.청원제목_원문}</option>)}</select></label><div className="featured"><strong>{target.청원제목_원문}</strong><p>{target.공식답변_핵심요약}</p><LinkOut href={target.원본URL}>원문 보기</LinkOut></div><h3>연관 청원 추천</h3>{suggestions.map(s=><div className="candidate" key={s.p.청원ID}><div className="section-heading"><strong>#{s.p.청원ID} {s.p.청원제목_원문}</strong><Pill variant={s.explicit?'green':'amber'}>{s.explicit?'기존 CSV 연관관계':'자동 추천'}</Pill></div><div className="score">추천 점수 {s.score}/100</div><p className="muted tiny">{s.sameKey?'공통 현안 키 일치 · ':''}{s.sameArea?'같은 구 · ':''}{s.shared.length?`공통 표현: ${s.shared.join(', ')}`:'공통 표현 미확인'}{s.explicit?' · 기존 CSV 연결 있음':''}</p><button className="outline" onClick={()=>onSelect(s.p.청원ID)}>청원 상세 보기</button></div>)}</section><section className="panel"><h2>서로 다른 시민의견 보존</h2><p>예: 동천배수지 파크골프장 설치 요청(#3749)과 설치 반대(#3746)는 같은 현안의 상반된 입장입니다. 원본 청원을 합치거나 삭제하지 않습니다.</p><div className="info-area"><h4>검증 기준</h4><p>공통 주제 추천만으로 동일 행정사업을 확정할 수 없습니다. 실제 사업 연계에는 공식 문서와 관리자 확인이 필요합니다.</p></div></section></div>
}
function Accountability({petitions}:{petitions:Petition[]}){
 const [policies,setPolicies]=useState<Policy[]>(()=>readLocal('dudream-demo-policies-v1',INITIAL_POLICIES))
 const [changes,setChanges]=useState<Change[]>(()=>readLocal('dudream-demo-changes-v1',[]))
 const [active,setActive]=useState('DEMO-P1')
 const [stage,setStage]=useState(1)
 const [reason,setReason]=useState('')
 const current=policies.find(x=>x.id===active)||policies[0]
 useEffect(()=>{localStorage.setItem('dudream-demo-policies-v1',JSON.stringify(policies))},[policies])
 useEffect(()=>{localStorage.setItem('dudream-demo-changes-v1',JSON.stringify(changes))},[changes])
 function update(){if(!current||!reason.trim())return;setPolicies(prev=>prev.map(p=>p.id===active?{...p,stage}:p));setChanges(prev=>[{policyId:active,from:current.stage,to:stage,reason:reason.trim(),when:new Date().toLocaleString('ko-KR')},...prev]);setReason('')}
 return <div className="page-grid"><section className="panel"><div className="section-heading"><h2>Decidim 방식 정책 추진 추적</h2><Pill variant="amber">시연용 정책안건</Pill></div><label className="label">정책안건<select value={active} onChange={e=>{setActive(e.target.value);setReason('')}}>{policies.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label><h3>{current.title}</h3><p>{current.description}</p><h4 className="subheading">제안형 추진단계</h4><ol className="steps">{STAGES.map((s,i)=><li key={s} className={current.stage===i?'current':''}><span>{i+1}</span><strong>{s}</strong>{i===current.stage&&<Pill variant="blue">시연 단계</Pill>}</li>)}</ol><h4 className="subheading">연결된 실제 청원</h4>{current.petitionIds.map(id=>{const p=petitions.find(x=>x.청원ID===id);return <div key={id} className="linkedpetition">#{id} {p?.청원제목_원문||'청원 제목 확인 필요'}{p?.원본URL&&<LinkOut href={p.원본URL}>원문</LinkOut>}</div>})}</section><section className="panel"><h2>시연용 단계 변경·이력</h2><label className="label">다음 단계<select value={stage} onChange={e=>setStage(Number(e.target.value))}>{STAGES.map((s,i)=><option value={i} key={s}>{s}</option>)}</select></label><label className="label">변경 사유<textarea rows={3} value={reason} onChange={e=>setReason(e.target.value)} placeholder="예: 시민 의견 수렴 결과 반영 (가상 시연)"/></label><button disabled={!reason.trim()||stage===current.stage} className="primary" onClick={update}>시연 단계 변경 기록</button><h3 className="subheading">변경 이력</h3>{changes.filter(c=>c.policyId===active).length===0?<p className="muted">아직 이력이 없습니다.</p>:<div className="history">{changes.filter(c=>c.policyId===active).map((c,i)=><div className="history-item" key={`${c.when}-${i}`}><small>{c.when}</small><p><strong>{STAGES[c.from]}</strong> → <strong>{STAGES[c.to]}</strong></p><p>{c.reason}</p><Pill variant="amber">데모 변경</Pill></div>)}</div>}</section></div>
}
export default function App(){
 const [all,setAll]=useState<{petitions:Petition[];relations:Relation[];summary:Summary[]}|null>(null)
 const [error,setError]=useState('')
 const [view,setView]=useState<View>('hub')
 const [hubDetail,setHubDetail]=useState<'home'|'map'|'watch'|'events'>('home')
 const [selected,setSelected]=useState<string|null>(null)
 const [selectedResearch,setSelectedResearch]=useState<string|null>(null)
 const [search,setSearch]=useState('')
 const [area,setArea]=useState('전체')
 const [category,setCategory]=useState('전체')
 useEffect(()=>{loadData().then(setAll).catch(e=>setError(String(e)))},[])
 const ps=all?.petitions||[]
 const rs=all?.relations||[]
 const filtered=useMemo(()=>ps.filter(p=>(area==='전체'||district(p)===area)&&(category==='전체'||p.분야===category)&&(!search||[p.청원제목_원문,p.지역_청원내용기반,p.청원ID,p.공통현안키].join(' ').toLowerCase().includes(search.toLowerCase()))),[ps,area,category,search])
 const sel=ps.find(p=>p.청원ID===selected)||null
 function select(id:string){setSelected(id);setSelectedResearch(null);setView('tracker');window.scrollTo({top:0,behavior:'smooth'})}
 function selectResearch(id:string){setSelectedResearch(id);setView('tracker')}
 useEffect(()=>{if(selectedResearch && view==='petitions')requestAnimationFrame(()=>document.getElementById('research-case-detail')?.scrollIntoView({behavior:'smooth',block:'start'}))},[selectedResearch,view])
 if(error)return <div className="error"><strong>데이터 로딩 오류</strong><p>{error}</p><p>public/data 안에 CSV 파일 3개가 있는지 확인하세요.</p></div>
 if(!all)return <div className="loading">NEXTRACK 데이터를 읽는 중…</div>
 const navigateFromChart=(field:'category'|'area'|'unverified',value:string)=>{setSearch('');setArea(field==='area'?value:'전체');setCategory(field==='category'?value:'전체');setView('petitions');window.scrollTo(0,0)}
 const categories=[...new Set(ps.map(p=>p.분야).filter(Boolean))]
 const tabs:[View,string,React.ReactNode][]=[['hub','우리 동네 행정소식',<MapPinned/>],['regional','내 동네 현황·참여',<CalendarDays/>],['tracker','진행상황 조회',<CheckCircle2/>]]
 return <div className="shell"><aside className="sidebar"><div className="brand"><div className="brand-mark"><MapPinned size={24}/></div><div>NEX<span>TRACK</span><small>시민청원 후속조치 모니터링</small></div></div><nav aria-label="주요 메뉴">{tabs.map(([v,label,ico])=><button key={v} className={view===v?'active':''} onClick={()=>{setView(v);if(v==='hub')setHubDetail('home');if(location.pathname.startsWith('/issues/'))history.pushState({},'', '/')}}>{ico}{label}</button>)}</nav></aside><main className="content"><header className="top"><div><h1>{tabs.find(x=>x[0]===view)?.[1]}</h1><p>답변 이후 지금 어디까지 진행됐고 다음 단계가 무엇인지 확인합니다</p></div><div className="tag-row"><Pill>조사기준일 2026.11.20</Pill></div></header>
 {view==='hub'&&<div className="admin-news">{hubDetail==='home'?<><div className="admin-news-hero"><span>MY NEIGHBORHOOD</span><h2>우리 동네 행정소식</h2><p>내 주변의 후속조치·참여 기회·관심 소식을 필요한 페이지에서 확인하세요.</p></div><div className="admin-news-cards"><button onClick={()=>setHubDetail('map')}><MapPinned/><strong>우리 동네 정책지도</strong><span>실제 지도, 후속조치와 공고문 연결, 주민 제보</span><b>정책지도 열기 →</b></button><button onClick={()=>setHubDetail('watch')}><CalendarDays/><strong>관심 지역·키워드 구독</strong><span>관심 지역과 키워드를 설정해 확보된 행정자료 조회</span><b>구독 관리 열기 →</b></button><button onClick={()=>setHubDetail('events')}><CalendarDays/><strong>설명회·설문조사 일정</strong><span>공식자료로 확인한 참여 일정과 원문 조회</span><b>참여 일정 열기 →</b></button></div></>:<><div className="admin-news-detail-head"><button className="outline" onClick={()=>setHubDetail('home')}>← 우리 동네 행정소식</button><h2>{hubDetail==='map'?'우리 동네 정책지도':hubDetail==='watch'?'관심 지역·키워드 구독':'설명회·설문조사 일정'}</h2></div><NeighborhoodHub key={hubDetail} mode={hubDetail} petitions={ps} onSelect={select}/></>}</div>}
 {view==='regional'&&<RegionalWorkspace petitions={ps} relations={rs} onSelect={select}/>}
 {view==='tracker'&&<><TrackingWorkspace petitions={ps} relations={rs} onSelect={select} onNotices={()=>window.open('https://eminwon.yongin.go.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do','_blank','noopener,noreferrer')} selectedPetition={selected}/>{selectedResearch&&<ResearchCaseDetail researchCase={RESEARCH_CASES.find(c=>c.id===selectedResearch)!} onBack={()=>setSelectedResearch(null)}/>}{sel&&<section className="tracker-detail-panel"><div className="tracker-detail-head"><strong>선택한 청원 전체 상세 · #{sel.청원ID}</strong><button className="outline" onClick={()=>setSelected(null)}>상세 접기</button></div><PetitionDetail petition={sel} relations={rs} onSelect={select} onViewResearch={selectResearch}/></section>}</>}
 <footer><BookOpen size={15}/> <span className="footer-map-credit">· 지도 © OpenStreetMap 기여자</span></footer></main></div>
}
