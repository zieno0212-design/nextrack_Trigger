import http from 'node:http';
import {randomBytes,createHash,timingSafeEqual} from 'node:crypto';
import {resolve} from 'node:path';
import {createStore,runDailyCheck,WATCHES,SOURCES} from './monitor.mjs';

const PORT=Number(process.env.API_PORT||8787), HOST=process.env.API_HOST||'127.0.0.1';
const BASE=(process.env.PUBLIC_BASE_URL||`http://localhost:${PORT}`).replace(/\/$/,'');
const store=await createStore(resolve(process.env.DATA_FILE||'./server/data/state.json'));
const TOKEN=process.env.ADMIN_TOKEN||'';
const WEB_ORIGIN=process.env.WEB_ORIGIN||'http://localhost:5173';
const hash=s=>createHash('sha256').update(s).digest('hex');
const same=(a,b)=>{const x=Buffer.from(a||''),y=Buffer.from(b||'');return x.length===y.length&&timingSafeEqual(x,y)};
const token=()=>randomBytes(32).toString('hex');
const safe=s=>String(s||'').replace(/[<>]/g,'').slice(0,150);
const rateBuckets=new Map();
function throttled(req,kind,limit=5){const key=kind+':'+(req.socket.remoteAddress||'local');const now=Date.now();const xs=(rateBuckets.get(key)||[]).filter(x=>now-x<60*60_000);if(xs.length>=limit)return true;xs.push(now);rateBuckets.set(key,xs);return false;}
const json=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':WEB_ORIGIN,'Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Allow-Methods':'GET, POST, OPTIONS'});res.end(JSON.stringify(data))};
const html=(res,status,body)=>{res.writeHead(status,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(`<meta charset="utf-8"><title>NEXTRACK</title><p>${body}</p><p><a href="${WEB_ORIGIN}">사이트로 돌아가기</a></p>`)};
const body=async req=>{let n=0,chunks=[];for await (const c of req){n+=c.length;if(n>100_000)throw Error('요청 크기 제한');chunks.push(c)}return JSON.parse(Buffer.concat(chunks).toString()||'{}')};
const unauthorized=req=>!TOKEN||!same((req.headers.authorization||'').replace(/^Bearer\s+/i,''),TOKEN);
let pushLibrary;try{pushLibrary=(await import('web-push')).default}catch{};
if(pushLibrary&&process.env.VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY)pushLibrary.setVapidDetails(process.env.VAPID_SUBJECT||'mailto:admin@example.org',process.env.VAPID_PUBLIC_KEY,process.env.VAPID_PRIVATE_KEY);
async function resend(to,subject,message){if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM)throw Error('RESEND 설정 없음');const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${process.env.RESEND_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM,to:[to],subject,text:message})});if(!r.ok)throw Error('메일 발송 오류 '+r.status);return r.json()}
function matched(s,c){return s.active&&s.verified&&s.region===WATCHES[0].region&&(s.dong==='전체'||s.dong===WATCHES[0].dong)&&(!s.keywords.length||s.keywords.some(k=>(c.title+' '+c.analysis?.summary).includes(k)))}
async function notify(candidate){const state=await store.read();for(const s of state.subscriptions.filter(x=>matched(x,candidate))){
 const key=hash(s.id+':'+candidate.id);if(state.deliveries.some(d=>d.key===key&&d.status==='sent'))continue;
 const summary=(candidate.analysis?.summary||'원문 검토 필요').slice(0,250);
 const message=`NEXTRACK: 성복동 분동 관련 새 행정자료 후보\n${candidate.title}\n${summary}\n공식 원문: ${candidate.url}\n후보 자료로서 실제 시행을 확정하지 않습니다.\n구독 해제: ${BASE}/api/track/unsubscribe?token=${s.unsubscribeToken}`;
 let status='not_configured',error='';try{if(s.type==='email'){await resend(s.email,'[NEXTRACK] 성복동 관련자료 후보',message);status='sent'}else if(s.type==='push'&&pushLibrary&&process.env.VAPID_PRIVATE_KEY){await pushLibrary.sendNotification(s.push,JSON.stringify({title:'NEXTRACK · 새 행정자료 후보',body:`${candidate.title} · 검토 필요`,url:candidate.url}));status='sent'}else error='발송 서비스 미설정'}catch(e){error=e.message||String(e);status='error'}
 await store.update(st=>{st.deliveries.unshift({key,subscriptionId:s.id,candidateId:candidate.id,at:new Date().toISOString(),status,error});st.deliveries=st.deliveries.slice(0,500)})
}}
let running=false;async function execute(){if(running)return null;running=true;try{return await runDailyCheck(store,{onNew:notify})}finally{running=false}}
// 한국시간 09:00 일 1회. 재시작해도 오늘 이미 실행한 경우 재수집을 피함.
function kstDay(d=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(d)}
function kstHour(d=new Date()){return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Seoul',hour:'2-digit',hourCycle:'h23'}).format(d))}
async function schedule(){const last=(await store.read()).lastCheck?.at;if(kstHour()>=9&&(!last||kstDay(new Date(last))!==kstDay())){await execute()}}
setInterval(()=>void schedule().catch(e=>console.error('daily check',e)),60_000).unref();
if(process.env.RUN_ON_START==='true')void schedule().catch(e=>console.error('startup check',e));

const server=http.createServer(async(req,res)=>{try{
 const url=new URL(req.url,BASE);if(req.method==='OPTIONS')return json(res,200,{});
 if(url.pathname==='/api/track/health')return json(res,200,{ok:true,server:true,scheduler:'daily 09:00 Asia/Seoul',configured:{email:!!(process.env.RESEND_API_KEY&&process.env.RESEND_FROM),push:!!(pushLibrary&&process.env.VAPID_PRIVATE_KEY),ai:!!process.env.OPENAI_API_KEY},lastCheck:(await store.read()).lastCheck});
 if(url.pathname==='/api/track/events'){const s=await store.read();return json(res,200,{watch:WATCHES[0],lastCheck:s.lastCheck,candidates:s.candidates.map(({id,title,date,url,source,matched,analysis,reviewStatus,discoveredAt})=>({id,title,date,url,source,matched,analysis,reviewStatus,discoveredAt})).slice(0,60),sources:SOURCES})}
 if(url.pathname==='/api/track/vapid')return json(res,200,{publicKey:process.env.VAPID_PUBLIC_KEY||null});
 if(url.pathname==='/api/track/subscribe/email'&&req.method==='POST'){
 if(throttled(req,'email'))return json(res,429,{error:'구독 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.'});
 const b=await body(req);const email=String(b.email||'').trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)return json(res,400,{error:'이메일 주소를 확인하세요'});
 const region=b.region==='수지구'?'수지구':'';if(!region)return json(res,400,{error:'현재 수지구 성복동 알림만 지원합니다'});
 const id=token(),verifyToken=token(),unsub=token();const keywords=(Array.isArray(b.keywords)?b.keywords:[]).map(x=>safe(x).slice(0,25)).slice(0,8);
 const subscription={id,type:'email',email,region,dong:'성복동',keywords,verified:false,active:true,verifyHash:hash(verifyToken),unsubscribeToken:unsub,createdAt:new Date().toISOString()};
 if(!(process.env.RESEND_API_KEY&&process.env.RESEND_FROM))return json(res,503,{error:'이메일 발송이 설정되지 않았습니다. 관리자에게 RESEND 환경변수 설정을 요청하세요.'});
 await resend(email,'[NEXTRACK] 알림 구독 이메일 인증',`아래 링크를 열어 성복동 후속 행정자료 알림을 활성화하세요.\n${BASE}/api/track/verify?id=${encodeURIComponent(id)}&token=${verifyToken}\n\n요청하지 않았다면 무시하세요.`);
 await store.update(s=>{s.subscriptions=s.subscriptions.filter(x=>!(x.type==='email'&&x.email===email));s.subscriptions.push(subscription)});
 return json(res,200,{ok:true,message:'이메일 인증 링크를 발송했습니다. 링크를 열어야 알림이 활성화됩니다.'});
 }
 if(url.pathname==='/api/track/verify'){
 const s=await store.read();const x=s.subscriptions.find(x=>x.id===url.searchParams.get('id'));if(!x||!same(x.verifyHash||'',hash(url.searchParams.get('token')||'')))return html(res,400,'유효하지 않은 인증 링크입니다.');
 await store.update(s=>{const v=s.subscriptions.find(y=>y.id===x.id);if(v){v.verified=true;v.verifiedAt=new Date().toISOString()}});return html(res,200,'이메일 알림 구독 인증이 완료되었습니다.');
 }
 if(url.pathname==='/api/track/unsubscribe'){
 const v=url.searchParams.get('token')||'';const s=await store.read();const x=s.subscriptions.find(x=>same(x.unsubscribeToken,v));if(!x)return html(res,400,'유효하지 않은 해제 링크입니다.');await store.update(st=>{const item=st.subscriptions.find(y=>y.id===x.id);if(item)item.active=false});return html(res,200,'알림 구독이 해제되었습니다.');
 }
 if(url.pathname==='/api/track/subscribe/push'&&req.method==='POST'){
 if(throttled(req,'push',20))return json(res,429,{error:'요청 한도를 초과했습니다.'});
 if(!pushLibrary||!process.env.VAPID_PRIVATE_KEY)return json(res,503,{error:'푸시 인증키가 설정되지 않았습니다'});
 const b=await body(req);if(!b.subscription?.endpoint||!/^https:\/\//.test(b.subscription.endpoint)||!b.subscription.keys?.auth||!b.subscription.keys?.p256dh)return json(res,400,{error:'유효하지 않은 브라우저 구독'});
 const id=hash(b.subscription.endpoint);await store.update(s=>{s.subscriptions=s.subscriptions.filter(x=>x.id!==id);s.subscriptions.push({id,type:'push',push:b.subscription,region:'수지구',dong:'성복동',keywords:[],active:true,verified:true,unsubscribeToken:token(),createdAt:new Date().toISOString()})});return json(res,200,{ok:true})
 }
 if(url.pathname==='/api/track/unsubscribe/push'&&req.method==='POST'){
 const b=await body(req);const endpoint=String(b.endpoint||'');if(!endpoint)return json(res,400,{error:'구독정보 없음'});const id=hash(endpoint);await store.update(s=>{const subscription=s.subscriptions.find(x=>x.id===id&&x.type==='push');if(subscription)subscription.active=false});return json(res,200,{ok:true})
 }
 if(url.pathname==='/api/track/admin/check'&&req.method==='POST'){if(unauthorized(req))return json(res,401,{error:'관리자 인증 필요'});const result=await execute();return json(res,200,{ok:true,result:result||{note:'이미 조회 중'}})}
 if(url.pathname==='/api/track/admin/review'&&req.method==='POST'){if(unauthorized(req))return json(res,401,{error:'관리자 인증 필요'});const b=await body(req);if(!['검토 후보','원문 검증 완료','관련성 없음'].includes(b.status))return json(res,400,{error:'상태 오류'});await store.update(s=>{const c=s.candidates.find(x=>x.id===b.id);if(c){c.reviewStatus=b.status;c.reviewedAt=new Date().toISOString()}});return json(res,200,{ok:true})}
 return json(res,404,{error:'Not found'});
}catch(e){console.error(e);return json(res,500,{error:'서버 오류',detail:process.env.NODE_ENV==='development'?String(e.message):undefined})}});
server.listen(PORT,HOST,()=>console.log(`[Dudream TRACK API] http://${HOST}:${PORT} / daily 09:00 KST`));
