import {useEffect,useState} from 'react'
import {Bell,BellRing,ExternalLink,RefreshCw,ShieldAlert,FileSearch} from 'lucide-react'
import {readArea} from './localAreas'
import {FILTER_EVENT,keywordValues} from './sharedFilters'

type Candidate={id:string;title:string;url:string;date:string;source:string;status:string;matched:string[]}
type Feed={ok:boolean;phase:string;items:Candidate[];checkedAt:string;note:string;sources:{source:string;url:string;status:string}[]}
const STORE='dt-seongbok-followup-seen-v1'
const REMIND='dt-seongbok-event-reminder-20261204'
function getSeen():string[] {try{return JSON.parse(localStorage.getItem(STORE)||'[]')}catch{return []}}
export function SeongbokFollowupWatch({compact=false}:{compact?:boolean}){
 const [area,setArea]=useState(readArea)
 const [keywords,setKeywords]=useState(keywordValues)
 const [data,setData]=useState<Feed|null>(null)
 const [error,setError]=useState('')
 const [loading,setLoading]=useState(false)
 const [permission,setPermission]=useState(typeof Notification==='undefined'?'unsupported':Notification.permission)
 const [newItems,setNewItems]=useState<string[]>([])
 const [reminder,setReminder]=useState(false)
 const isInterested=area.region==='수지구'&&area.dong==='성복동'&&(keywords.length===0||keywords.some(k=>['성복동 분동 주민설명회 설문조사 행정구역 개편'].includes(k)))
 const watchSubscription=()=>{try{const x=JSON.parse(localStorage.getItem('dt-watch-v1')||'null');return Boolean(x?.active && x.region==='수지구' && x.dong==='성복동' && (!String(x.keywords||'').trim() || /성복|분동|설명회|설문/.test(x.keywords)))}catch{return false}}
 const [subscribed,setSubscribed]=useState(watchSubscription)
 const check=async()=>{setLoading(true);setError('');try{
  const r=await fetch('/api/followups/seongbok',{cache:'no-store'});const json=await r.json() as Feed;
  if(!r.ok||!json.ok)throw Error(json.note||'공식 목록을 조회할 수 없습니다');
  setData(json);const latest=json.items.map(x=>x.id);const seen=getSeen();const fresh=seen.length?latest.filter(id=>!seen.includes(id)):[];
  setNewItems(fresh);localStorage.setItem(STORE,JSON.stringify([...new Set([...seen,...latest])].slice(-200)));
  if(fresh.length && subscribed && typeof Notification!=='undefined' && Notification.permission==='granted')new Notification('NEXTRACK · 성복동 관련자료 후보',{body:`새로운 검토 후보 ${fresh.length}건이 발견됐습니다. 원문 확인이 필요합니다.`});
 }catch(e){setError(e instanceof Error?e.message:'조회 오류')}finally{setLoading(false)}}
 useEffect(()=>{const f=()=>{setArea(readArea());setKeywords(keywordValues());setSubscribed(watchSubscription())};window.addEventListener(FILTER_EVENT,f);window.addEventListener('storage',f);return()=>{window.removeEventListener(FILTER_EVENT,f);window.removeEventListener('storage',f)}},[])
 useEffect(()=>{void check();const timer=window.setInterval(()=>{if(document.visibilityState==='visible')void check()},30*60_000);const onFocus=()=>void check();window.addEventListener('focus',onFocus);return()=>{window.clearInterval(timer);window.removeEventListener('focus',onFocus)}},[subscribed])
 useEffect(()=>{if(!subscribed||typeof Notification==='undefined'||Notification.permission!=='granted')return;const now=new Date();const eventDate=new Date('2026-12-04T10:00:00+09:00');const left=eventDate.getTime()-now.getTime();if(left<=0||left>7*86400000||localStorage.getItem(REMIND))return;new Notification('성복동 분동 주민설명회 예정',{body:'12월 4일 오전 10시 · 성복동 행정복지센터 2층 대회의실'});localStorage.setItem(REMIND,new Date().toISOString());setReminder(true)},[subscribed,permission])
 const requestNotification=async()=>{if(typeof Notification==='undefined')return;const result=await Notification.requestPermission();setPermission(result)}
 return <section className={'followup-watch '+(subscribed?'followup-watch-active ':'')+(compact?'compact':'')}>
  <div className="followup-watch-head"><div><span className="regional-label">AFTER EVENT · DOCUMENT WATCH</span><h3><FileSearch size={19}/> 성복동 설명회 결과자료 확인</h3></div><button onClick={()=>void check()} disabled={loading}><RefreshCw size={15}/> {loading?'조회 중':'지금 확인'}</button></div>
  <p>2026년 12월 4일 설명회 이후 <b>공식 결과보고서·주민의견 수렴 결과·회의록</b> 관련 자료를 재조회합니다. </p>
  {isInterested&&<div className="followup-watch-spot"><BellRing size={17}/> 현재 지역·키워드 필터에서 <strong>성복동 설명회 일정이 강조</strong>됩니다. {subscribed?'관심 지역 구독 설정도 일치합니다.':'실제 알림을 받으려면 구독 상세에서 수지구·성복동을 저장하세요.'}</div>}
  <div className="followup-watch-meta"><span>관심 구독: <b>{subscribed?'성복동 등록':'미등록'}</b></span><span>브라우저 알림: <b>{permission==='granted'?'허용':permission==='denied'?'차단':'미허용'}</b></span>{subscribed&&permission==='default'&&<button onClick={()=>void requestNotification()}><Bell size={14}/> 브라우저 알림 허용</button>}</div>
  {reminder&&<p className="followup-watch-info">설명회 사전 알림을 표시했습니다.</p>}
  {data?.phase==='scheduled'&&<p className="followup-watch-info">설명회 예정일 전입니다. 12월 4일 이후부터 공식 공개자료를 재조회합니다.</p>}
  {error&&<p className="followup-watch-error"><ShieldAlert size={15}/> {error} · 검색 실패가 자료 부재를 뜻하지는 않습니다.</p>}
  {data?.phase==='watching'&&<p className="followup-watch-info">최근 조회: {new Date(data.checkedAt).toLocaleString('ko-KR')} · 검토 후보 {data.items.length}건 · 신규 {newItems.length}건</p>}
  {data?.items?.length? <div className="followup-watch-results">{data.items.map(item=><a key={item.id} href={item.url} target="_blank" rel="noreferrer"><small>{newItems.includes(item.id)?'새 후보 · ':''}{item.source} · {item.date||'게시일 추가 확인'}</small><strong>{item.title}</strong><span>관련자료 검토 후보 · 공식 원문 확인 필요 <ExternalLink size={13}/></span></a>)}</div>:data?.phase==='watching'&&!error?<p className="followup-watch-info">조회된 공식 목록에서 새 후보가 발견되지 않았습니다. 설명회가 열리지 않았다는 의미가 아닙니다.</p>:null}
  <details><summary>자동 재조회 범위와 공식 검색 출처</summary><p>웹사이트가 열린 동안 30분 간격, 탭으로 돌아올 때 다시 조회합니다. </p><ul>{(data?.sources||[]).map(s=><li key={s.source}><a href={s.url} target="_blank" rel="noreferrer">{s.source}</a> · {s.status}</li>)}</ul></details>
 </section>
}
