import {useEffect,useState} from 'react'
import {BellRing,FileSearch,RefreshCw,ShieldCheck,ExternalLink,Mail} from 'lucide-react'
import {readArea} from './localAreas'
import {FILTER_EVENT,keywordValues} from './sharedFilters'

type Candidate={id:string;title:string;url:string;date:string;source:string;reviewStatus:string;discoveredAt:string;analysis:{mode:string;summary:string;change:string;evidence:string;state:string;verified:boolean;reason?:string}}
type Feed={candidates:Candidate[];lastCheck:null|{at:string;phase:string;added:number;note:string;sources:{name:string;status:string;error?:string}[]}}
type Health={ok:boolean;server:boolean;scheduler:string;configured:{email:boolean;push:boolean;ai:boolean}}
function base64ToUint8Array(base64:string){const padding='='.repeat((4-base64.length%4)%4);const raw=atob((base64+padding).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}
export function ServerMonitoring(){
 const [area,setArea]=useState(readArea)
 const [keywords,setKeywords]=useState(keywordValues)
 const [health,setHealth]=useState<Health|null>(null)
 const [feed,setFeed]=useState<Feed|null>(null)
 const [email,setEmail]=useState('')
 const [result,setResult]=useState('')
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 const refresh=async()=>{try{setError('');const [a,b]=await Promise.all([fetch('/api/track/health'),fetch('/api/track/events')]);if(!a.ok||!b.ok)throw Error('모니터링 서버 조회 실패');setHealth(await a.json());setFeed(await b.json())}catch{setError('상시 모니터링 서버에 연결되지 않았습니다. npm run dev:full 또는 배포 서버 설정을 확인하세요.') }}
 useEffect(()=>{void refresh();const timer=window.setInterval(()=>void refresh(),5*60_000);const update=()=>{setArea(readArea());setKeywords(keywordValues())};window.addEventListener(FILTER_EVENT,update);return()=>{clearInterval(timer);window.removeEventListener(FILTER_EVENT,update)}},[])
 const selected=area.region==='전체'||(area.region==='수지구'&&(area.dong==='전체'||area.dong==='성복동'))
 const show=(feed?.candidates||[]).filter(c=>selected&&(!keywords.length||keywords.some(k=>(c.title+' '+c.analysis?.summary).includes(k))))
 const subscribeEmail=async()=>{setBusy(true);setResult('');try{const response=await fetch('/api/track/subscribe/email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,region:'수지구',dong:'성복동',keywords})});const j=await response.json();setResult(response.ok?j.message:(j.error||'구독 실패'))}catch{setResult('서버 연결 실패')}finally{setBusy(false)}}
 const unsubscribePush=async()=>{setBusy(true);try{const reg=await navigator.serviceWorker.getRegistration('/sw.js');const sub=await reg?.pushManager.getSubscription();if(!sub){setResult('현재 등록된 푸시 구독이 없습니다.');return}await fetch('/api/track/unsubscribe/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({endpoint:sub.endpoint})});await sub.unsubscribe();setResult('이 브라우저의 푸시 구독이 해제됐습니다.')}catch{setResult('푸시 구독 해제 중 오류가 발생했습니다.')}finally{setBusy(false)}}
 const subscribePush=async()=>{setBusy(true);setResult('');try{
  if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window))throw Error('이 브라우저에서 푸시 지원되지 않음');
  if(!window.isSecureContext)throw Error('HTTPS 또는 localhost 환경에서만 푸시 구독 가능');
  const perm=await Notification.requestPermission();if(perm!=='granted')throw Error('알림 권한이 허용되지 않았습니다');
  const keyResponse=await fetch('/api/track/vapid');if(!keyResponse.ok)throw Error('서버 연결 실패');const {publicKey}=await keyResponse.json();if(!publicKey)throw Error('서버 VAPID 키 미설정');
  const reg=await navigator.serviceWorker.register('/sw.js');const subscription=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:base64ToUint8Array(publicKey)});
  const response=await fetch('/api/track/subscribe/push',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription})});if(!response.ok)throw Error((await response.json()).error||'구독 실패');setResult('브라우저 푸시 구독을 등록했습니다. 서버가 운영 중이고 새 후보가 발견될 때 알림을 발송합니다.');
 }catch(e){setResult(e instanceof Error?e.message:'푸시 구독 오류')}finally{setBusy(false)}}
 return <section className="server-monitor" aria-label="상시 모니터링과 AI 후속자료 분석">
  <div className="server-monitor-header"><div><span className="regional-label">SERVER WATCH · EVIDENCE REVIEW</span><h3><FileSearch size={19}/> 후속자료 상시 추적 · AI 비교 · 알림</h3></div><button onClick={()=>void refresh()}><RefreshCw size={15}/> 상태 새로고침</button></div>
  <p>서버가 매일 오전 9시(KST) 공식 공개 목록을 확인하고 새 자료 후보를 저장합니다. AI는 공식 답변의 약속과 새 문서를 비교하지만, <b>확정적인 시행·개최 판정은 하지 않습니다.</b></p>
  <div className="server-monitor-tags"><span>서버: <strong>{health?'연결됨':'미연결'}</strong></span><span>AI: <strong>{health?.configured.ai?'API 연결 설정':'규칙 기반'}</strong></span><span>이메일: <strong>{health?.configured.email?'설정됨':'미설정'}</strong></span><span>푸시: <strong>{health?.configured.push?'설정됨':'미설정'}</strong></span></div>
  {error&&<p className="followup-watch-error">{error}</p>}
  {feed?.lastCheck&&<div className="server-monitor-check"><ShieldCheck size={16}/><span>최근 서버 점검: {new Date(feed.lastCheck.at).toLocaleString('ko-KR')} · 신규 후보 {feed.lastCheck.added}건 · {feed.lastCheck.note}</span></div>}
  <div className="server-monitor-subscribe"><h4><BellRing size={16}/> 성복동 후속자료 알림 구독</h4><p>이메일 확인 링크를 열어야 구독이 활성화됩니다. 새 관련자료 후보가 발견되면 원문 링크를 발송합니다.</p><div className="server-monitor-actions"><label htmlFor="monitor-email" className="sr-only">이메일 주소</label><input id="monitor-email" type="email" placeholder="이메일 주소" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email"/><button disabled={busy||!health?.configured.email||!email.includes('@')} onClick={()=>void subscribeEmail()}><Mail size={15}/> 이메일 구독</button><button disabled={busy||!health?.configured.push} onClick={()=>void subscribePush()}><BellRing size={15}/> 푸시 구독</button><button disabled={busy} onClick={()=>void unsubscribePush()}>푸시 해제</button></div>{result&&<p className="server-monitor-result">{result}</p>}</div>
  <div className="server-monitor-results"><h4>수집된 관련자료 후보 ({show.length}건)</h4>{show.length?show.map(c=><div key={c.id} className="server-monitor-candidate"><div><strong>{c.title}</strong><span>{c.source} · {c.date||'게시일 미확인'} · {c.reviewStatus}</span></div><p>{c.analysis.summary}</p><small>변경 요약: {c.analysis.change} · 분석 방식: {c.analysis.mode}</small><a href={c.url} target="_blank" rel="noreferrer">원문 확인 <ExternalLink size={14}/></a></div>):<p className="server-monitor-empty">{selected?'현재 저장된 관련자료 후보가 없습니다. 수집 실패·자료 미공개 여부는 점검 내역을 확인하세요.':'설정된 지역에서 확인된 자료가 없습니다. 이 지역에 현안이 없다는 뜻이 아닙니다.'}</p>}</div>
 </section>
}
