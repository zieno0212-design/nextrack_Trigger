import type {Plugin} from 'vite'

// 개발 서버에서 공공기관 게시 목록의 공개 링크 후보만 검색합니다.
// 외부 사이트가 차단하거나 HTML이 변경되면 오류/0건을 그대로 전달합니다.
const SOURCES=[
 {name:'용인시 보도자료',url:'https://www.yongin.go.kr/user/bbs/BD_selectBbsList.do?q_bbsCode=1020'},
 {name:'용인시 고시·공고',url:'https://eminwon.yongin.go.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do?Key=B_Subject&context=NTIS&homepage_pbs_yn=Y&jndinm=OfrNotAncmtEJB&method=selectListOfrNotAncmt&methodnm=selectListOfrNotAncmtHomepage&not_ancmt_se_code=01%2C02%2C03%2C04%2C05&ofr_pageSize=200&pageIndex=1&subCheck=Y'},
 {name:'용인시의회 회의록',url:'https://council.yongin.go.kr/kr/minutes.do'}
]
export type FollowupCandidate={id:string;title:string;url:string;source:string;date:string;status:'관련자료 검토 후보';matched:string[]}
function decode(s:string){return s.replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&nbsp;/gi,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)))}
function plain(s:string){return decode(s.replace(/<[^>]*>/g,' ')).replace(/\s+/g,' ').trim()}
const safeUrl=(href:string,base:string)=>{try{const url=new URL(decode(href),base);if(url.protocol!=='https:'||!/(^|\.)yongin\.go\.kr$/.test(url.hostname))return '';return url.href}catch{return ''}}
export function extractCandidates(html:string,base:string,source:string):FollowupCandidate[]{
 const results:FollowupCandidate[]=[];const seen=new Set<string>();
 for(const a of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)){
  const attrs=a[1],title=plain(a[2]);const href=attrs.match(/href\s*=\s*['"]([^'"]+)['"]/i)?.[1]||'';
  const url=safeUrl(href,base);if(!url||url.includes('javascript:')||title.length<9)continue
  const matched=['성복동','분동','주민설명회','설문','결과','회의록'].filter(k=>title.includes(k));
  // 제목에 성복동과 분동 관련성이 동시에 있어야 합니다. 일반 성복동 보도는 제외.
  if(!title.includes('성복동')||!(title.includes('분동')||title.includes('행정구역 개편')))continue;
  // 11월 17일 개최 공고를 결과 자료로 잘못 매칭하지 않도록 제한.
  if(!/결과|개최했|개최 결과|회의록|의견수렴|설문조사 결과|설명회 후기|설명회 개최/.test(title))continue;
  const start=Math.max(0,(a.index||0)-150),end=Math.min(html.length,(a.index||0)+a[0].length+200);const around=plain(html.slice(start,end));
  const m=around.match(/(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})/);const date=m?`${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`:'';
  if(date&&date<'2026-12-04')continue;
  if(seen.has(url))continue;seen.add(url);
  results.push({id:url,title,url,source,date,status:'관련자료 검토 후보',matched})
 }
 return results.slice(0,20)
}
let cache:{time:number,data:unknown}|null=null
export function seongbokFollowupPlugin():Plugin{return {name:'dudream-seongbok-followups',configureServer(server){server.middlewares.use('/api/followups/seongbok',async(_req,res)=>{
 res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','no-store');
 if(Date.now()<new Date('2026-12-04T10:00:00+09:00').getTime()){
  res.end(JSON.stringify({ok:true,phase:'scheduled',items:[],checkedAt:new Date().toISOString(),sources:SOURCES.map(s=>({source:s.name,url:s.url,status:'예정일 전'})),note:'설명회 개최 전이므로 결과 자료 자동 조회는 시작되지 않았습니다.'}));return;
 }
 if(cache&&Date.now()-cache.time<30*60_000){res.end(JSON.stringify(cache.data));return}
 const statuses: {source:string;url:string;status:string}[]=[];const all:FollowupCandidate[]=[];
 for(const s of SOURCES){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),8000);try{
  const response=await fetch(s.url,{signal:controller.signal,headers:{Accept:'text/html','User-Agent':'Mozilla/5.0 (compatible; DudreamTrackPrototype/1.0)'}});
  if(!response.ok)throw Error('HTTP '+response.status);
  const html=await response.text();if(!html.includes('<'))throw Error('HTML 형식 아님');
  const found=extractCandidates(html,s.url,s.name);all.push(...found);statuses.push({source:s.name,url:s.url,status:`조회됨 · 후보 ${found.length}건`})
 }catch(e){statuses.push({source:s.name,url:s.url,status:'접근 실패: '+(e instanceof Error?e.message:'오류')})}finally{clearTimeout(timer)}}
 const unique=[...new Map(all.map(x=>[x.url,x])).values()];const ok=statuses.some(x=>x.status.startsWith('조회됨'));
 const data={ok,phase:'watching',items:unique,checkedAt:new Date().toISOString(),sources:statuses,note:'검색 대상은 각 공식 목록의 노출 게시물이며 전체 자료를 보장하지 않습니다. 후보는 원문 대조 전까지 개최·결과 확인으로 간주하지 않습니다.'};
 if(ok)cache={time:Date.now(),data};res.statusCode=ok?200:503;res.end(JSON.stringify(data));
 })}}}
