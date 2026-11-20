import {useEffect,useMemo,useState} from 'react'
import {ArrowLeft,ArrowRight,CalendarDays,ClipboardCheck,FileSearch,FolderOpen,MapPin,RefreshCcw,ExternalLink} from 'lucide-react'
import {RegionalParticipation} from './RegionalParticipation'
import {ServerMonitoring} from './ServerMonitoring'
import {SeongbokFollowupWatch} from './SeongbokFollowupWatch'
import {district,type Petition,type Relation} from './data'
import {DocumentReview,IssueExplorer} from './Features'
import {TRACK_RECORDS,classifyPetition} from './trackingModel'
import {DONGS,GU,readArea,writeArea,matchesPetitionDong} from './localAreas'
import {FILTER_EVENT,broadcastArea,keywordValues,sharedKeywordMatch} from './sharedFilters'

type Section='home'|'issues'|'calendars'|'minutes'|'monitor'
const PAGES:[Exclude<Section,'home'>,string,string,string,React.ReactNode][]=[
 ['issues','우리 지역 후속조치·연결자료','답변 이후 조치 내용과 고시·보도자료 등 근거를 한곳에서 확인','사업·근거',<FolderOpen size={25}/>],
 ['calendars','후속조치·청원 마감 캘린더','후속조치 예정일과 진행 중인 청원 마감일을 구분해서 조회','2개 달력',<CalendarDays size={25}/>],
 ['minutes','회의록 추적','시의회·주민설명회 등 회의자료를 검색하고 관련성 검증 상태 확인','회의록',<ClipboardCheck size={25}/>],
 ['monitor','후속자료 상시 추적','새 고시·공고·보도자료 수집 현황, AI 비교, 구독 알림 확인','자동조회',<RefreshCcw size={25}/>]
]

// 실제 회의록이 아닌 UI 시연용 가상 기록입니다.
const DEMO_MINUTES=[
 {id:'DM01',region:'수지구',dong:'성복동',date:'2026-11-25',title:'[가상 예시] 성복동 행정구역 조정 주민의견 검토회의',summary:'주민 의견수렴 결과와 추가 설명회 준비사항을 논의한 상황을 가정한 시연 기록입니다.',stage:'검토중'},
 {id:'DM02',region:'수지구',dong:'죽전동',date:'2026-12-02',title:'[가상 예시] 죽전동 버스운행 개선 실무협의',summary:'배차 조정안과 운수사 협의 과정을 가정한 시연 기록입니다.',stage:'조치중'},
 {id:'DM03',region:'기흥구',dong:'보정동',date:'2026-12-08',title:'[가상 예시] 플랫폼시티 공사 환경관리 점검회의',summary:'분진 저감 조치와 현장점검을 논의한 상황을 가정한 시연 기록입니다.',stage:'조치중'},
 {id:'DM04',region:'기흥구',dong:'영덕동',date:'2026-11-27',title:'[가상 예시] 경전철 연장 관련 관계기관 검토회의',summary:'사전타당성조사 검토사항과 기관 간 의견수렴을 가정했습니다.',stage:'검토중'},
 {id:'DM05',region:'처인구',dong:'모현읍',date:'2026-12-12',title:'[가상 예시] 마을 대중교통 정류장 정비 결과회의',summary:'현장 정비 결과를 공유했다는 가정으로 만든 시연 기록입니다.',stage:'조치완료'}
]
function MinuteSearch({petitions,onSelect}:{petitions:Petition[];onSelect:(id:string)=>void}){
 const [area,setArea]=useState(readArea)
 const [keywords,setKeywords]=useState(keywordValues)
 const [query,setQuery]=useState('')
 const [showDemoMinutes,setShowDemoMinutes]=useState(true)
 useEffect(()=>{const update=()=>{setArea(readArea());setKeywords(keywordValues())};window.addEventListener(FILTER_EVENT,update);window.addEventListener('storage',update);return()=>{window.removeEventListener(FILTER_EVENT,update);window.removeEventListener('storage',update)}},[])
 const updateRegion=(region:string)=>{writeArea({region,dong:''});setArea({region,dong:''});broadcastArea()}
 const updateDong=(dong:string)=>{const next={...area,dong};writeArea(next);setArea(next);broadcastArea()}
 const candidates=useMemo(()=>petitions.filter(p=>(area.region==='전체'||district(p)===area.region)&&matchesPetitionDong(p,area.dong)&&(!!TRACK_RECORDS[p.청원ID]||classifyPetition(p).kind==='검토 후보')&&sharedKeywordMatch(p.청원제목_원문+' '+(TRACK_RECORDS[p.청원ID]?.action||''),keywords)&&(!query||(p.청원제목_원문+' '+(TRACK_RECORDS[p.청원ID]?.action||'')).includes(query))),[petitions,area,keywords,query])
 const demoMinutes=DEMO_MINUTES.filter(m=>(area.region==='전체'||m.region===area.region)&&(!area.dong||m.dong===area.dong)&&sharedKeywordMatch(m.title+' '+m.summary+' '+m.region+' '+m.dong,keywords)&&(!query||(m.title+' '+m.summary).includes(query)))
 return <div className="regional-standalone">
  <div className="regional-filters"><div className="regional-filter-title"><MapPin size={17}/><strong>회의록 검색 대상 지역</strong></div><div className="area-cascade"><label>구 선택<select value={area.region} onChange={e=>updateRegion(e.target.value)}>{GU.map(g=><option key={g}>{g}</option>)}</select></label><label>읍·면·동 선택<select value={area.dong} disabled={area.region==='전체'} onChange={e=>updateDong(e.target.value)}><option value="">전체 읍·면·동</option>{(DONGS[area.region]||[]).map(d=><option key={d}>{d}</option>)}</select></label></div><input aria-label="회의록 검색할 현안" placeholder="현안 또는 사업명" value={query} onChange={e=>setQuery(e.target.value)}/></div>
  <div className="regional-card"><div className="regional-section-head"><div><span className="regional-label">MEETING RECORD FOLLOW-UP</span><h3>회의록 후속정보 추적</h3></div></div><p>청원에 관련된 시의회 회의록·주민설명회 결과자료를 찾아 원문과 비교하는 페이지입니다. <strong>현재 등록된 표본에서 후속 회의록 원문으로 직접 검증된 자료는 없습니다.</strong> 회의가 없었다는 의미는 아닙니다.</p>
  <div className="regional-minutes-links"><a target="_blank" rel="noreferrer" href="https://council.yongin.go.kr/">용인특례시의회 공개자료 검색 <ExternalLink size={14}/></a><a target="_blank" rel="noreferrer" href="https://www.yongin.go.kr/">용인시 공식 홈페이지 <ExternalLink size={14}/></a></div></div>
  <div className="regional-card"><div className="regional-section-head"><div><span className="regional-label">DEMO MEETING RECORDS</span><h3>회의록 시연 예시</h3></div><label className="regional-check"><input type="checkbox" checked={showDemoMinutes} onChange={e=>setShowDemoMinutes(e.target.checked)}/> 가상 예시 보기</label></div>{showDemoMinutes?<div className="regional-minutes-list">{demoMinutes.map(m=><article key={m.id}><div><span className="demo-evidence-badge">가상 시연 자료 · 공식 회의록 아님</span><small> {m.date} · {m.region} {m.dong} · {m.stage}</small><h4>{m.title}</h4><p>{m.summary}</p></div></article>)}{!demoMinutes.length&&<p>선택 조건의 시연 예시가 없습니다.</p>}</div>:<p className="regional-intro">시연 예시가 숨겨졌습니다.</p>}</div>
  <div className="regional-card"><h3>회의록 연계 검토 대상 ({candidates.length}건)</h3><p className="regional-intro">확보한 공식 답변의 현안어를 이용해 관련 자료를 확인할 후보입니다. 자동 검색 결과나 실제 회의록이 확보된 것으로 표시하지 않습니다.</p><div className="regional-minutes-list">{candidates.map(p=><article key={p.청원ID}><div><span>#{p.청원ID} · {district(p)}</span><h4>{p.청원제목_원문}</h4><p>{TRACK_RECORDS[p.청원ID]?.action||'공식 답변의 후속 검토 문구 추가 확인 필요'}</p><small>회의록 원문 연결: 미확인 · 추적 후보</small></div><button onClick={()=>onSelect(p.청원ID)}>진행상황 조회 <ArrowRight size={14}/></button></article>)}{!candidates.length&&<p className="regional-intro">선택한 지역·키워드의 추적 후보가 없습니다.</p>}</div></div>
 </div>
}

export function RegionalWorkspace({petitions,relations,onSelect}:{petitions:Petition[];relations:Relation[];onSelect:(id:string)=>void}){
 const [section,setSection]=useState<Section>('home')
 const [linkageMode,setLinkageMode]=useState<'records'|'documents'|'similar'>('records')
 const current=PAGES.find(p=>p[0]===section)
 return <div className="regional-navigation">
  {section==='home'?<><div className="admin-news-hero"><span>LOCAL ACTION & PARTICIPATION</span><h2>내 동네 현황·참여</h2><p>우리 지역 후속조치부터 청원 마감일, 회의록과 새 행정자료까지 필요한 상세페이지를 선택하세요.</p></div><div className="regional-nav-cards">{PAGES.map(([key,title,desc,kind,icon])=><button key={key} onClick={()=>setSection(key)}><span className="regional-nav-icon">{icon}</span><span className="regional-nav-type">{kind}</span><strong>{title}</strong><span className="regional-nav-desc">{desc}</span><b>상세페이지 열기 <ArrowRight size={15}/></b></button>)}</div></>:<><div className="admin-news-detail-head regional-detail-heading"><button className="outline" onClick={()=>setSection('home')}><ArrowLeft size={15}/> 내 동네 현황·참여</button><h2>{current?.[1]}</h2><p>{current?.[2]}</p></div>
    {section==='issues'&&<><div className="regional-link-tabs" role="group" aria-label="행정자료와 유사청원 조회"><button className={linkageMode==='records'?'active':''} onClick={()=>setLinkageMode('records')}>지역 후속조치</button><button className={linkageMode==='documents'?'active':''} onClick={()=>setLinkageMode('documents')}>청원–행정자료 연결</button><button className={linkageMode==='similar'?'active':''} onClick={()=>setLinkageMode('similar')}>유사·반복 청원 통합</button></div>{linkageMode==='records'?<RegionalParticipation key="issues" mode="issues" petitions={petitions} onSelect={onSelect}/>:linkageMode==='documents'?<DocumentReview petitions={petitions} relations={relations}/>:<IssueExplorer petitions={petitions} relations={relations} onOpenPetition={onSelect}/>}</>}
    {section==='calendars'&&<RegionalParticipation key="calendars" mode="calendars" petitions={petitions} onSelect={onSelect}/>}
    {section==='minutes'&&<MinuteSearch petitions={petitions} onSelect={onSelect}/>}
    {section==='monitor'&&<div className="regional-standalone"><div className="regional-card"><h3>상시 수집·AI 비교 상태</h3><p>새 행정자료 확인, 관련성 비교, 이메일·웹 푸시 구독 관리 기능을 이 페이지에 통합했습니다. 서버가 연결되지 않은 경우 실제 자동 수집·발송은 이루어지지 않습니다.</p></div><SeongbokFollowupWatch compact/><ServerMonitoring/></div>}
   </>}
 </div>
}
