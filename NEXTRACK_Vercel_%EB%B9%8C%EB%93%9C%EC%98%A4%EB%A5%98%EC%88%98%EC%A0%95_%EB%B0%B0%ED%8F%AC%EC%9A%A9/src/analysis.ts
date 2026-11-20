import type {Petition,Relation} from './data'

export type Candidate={petition:Petition;score:number;sharedTerms:string[];sameDistrict:boolean;sameNeighborhood:boolean;sameIssueKey:boolean;documented:boolean;documentedEvidence:string[];reviewRequired:boolean;reason:string}
export type DocumentSuggestion={relation:Relation;kind:'documented'|'suggested';status:'pending'|'approved'|'rejected'|'needs_evidence';reason:string}
const STOP=new Set(['청원','요청','관련','및','사업','용인시','대하여','반대','찬성','위한','해주세요','개선','문제','검토','시민','공식','답변'])
const terms=(s:string)=>{const a=(s.normalize('NFKC').toLowerCase().replace(/[·–—\-]/g,' ').match(/[가-힣a-z0-9]{2,}/g)||[]);return [...new Set(a.filter(x=>!STOP.has(x)))]}
function bigrams(s:string){const t=s.normalize('NFKC').toLowerCase().replace(/\s+/g,'').replace(/[^가-힣a-z0-9]/g,'');return new Set([...t].slice(0,-1).map((c,i)=>c+t[i+1]))}
function jaccard<A>(a:Set<A>,b:Set<A>){const intersection=[...a].filter(x=>b.has(x)).length;const union=new Set([...a,...b]).size;return union?intersection/union:0}
export function petitionRelationCandidates(petition:Petition,all:Petition[],relations:Relation[]):Candidate[]{
 return all.filter(other=>other.청원ID!==petition.청원ID).map(other=>{
  const texts=[petition.청원제목_원문,petition.공통현안키,petition.지역_청원내용기반].join(' ')
  const otherTexts=[other.청원제목_원문,other.공통현안키,other.지역_청원내용기반].join(' ')
  const shared=terms(texts).filter(x=>terms(otherTexts).includes(x))
  const words=jaccard(new Set(terms(texts)),new Set(terms(otherTexts)))
  const grams=jaccard(bigrams(petition.청원제목_원문),bigrams(other.청원제목_원문))
  const area=(p:Petition)=>{const m=p.지역_청원내용기반.match(/(수지구|기흥구|처인구)/);return m?.[1]||''}
  const neighborhood=(p:Petition)=>{const m=p.지역_청원내용기반.match(/[가-힣]+(?:동|읍|면)/);return m?.[0]||''}
  const sameDistrict=Boolean(area(petition)&&area(petition)===area(other))
  const sameNeighborhood=Boolean(neighborhood(petition)&&neighborhood(petition)===neighborhood(other))
  const sameIssueKey=Boolean(petition.공통현안키&&other.공통현안키&&petition.공통현안키===other.공통현안키)
  const listed=(p:Petition,id:string)=>(p.유사청원ID||'').split(/[;,\s]+/).includes(id)
  const evidence=relations.filter(r=>(r.청원ID===petition.청원ID&&r.자료URL?.includes('q_petitSn='+other.청원ID))||(r.청원ID===other.청원ID&&r.자료URL?.includes('q_petitSn='+petition.청원ID))).map(r=>r.연결설명)
  const documented=listed(petition,other.청원ID)||listed(other,petition.청원ID)||evidence.length>0
  const score=Math.min(100,Math.round(words*35+grams*25+(sameDistrict?5:0)+(sameNeighborhood?10:0)+(sameIssueKey?20:0)+(documented?15:0)))
  const why=[documented?'CSV에 연결 관계 기록':null,sameIssueKey?'공통 현안 키 일치':null,sameNeighborhood?'같은 동·읍·면':sameDistrict?'같은 구':null,shared.length?`공통 표현: ${shared.slice(0,6).join(', ')}`:null].filter(Boolean).join(' · ')||'제목 일부 유사(검토 필요)'
  return {petition:other,score,sharedTerms:shared.slice(0,8),sameDistrict,sameNeighborhood,sameIssueKey,documented,documentedEvidence:evidence,reviewRequired:true,reason:why}
 }).filter(x=>x.documented||x.score>=15).sort((a,b)=>Number(b.documented)-Number(a.documented)||b.score-a.score)
}
export function groupPublicIssues(petitions:Petition[],relations:Relation[]){
 const taken=new Set<string>(); const result:{id:string;name:string;petitions:Petition[];evidence:string}[]=[]
 for(const p of petitions){if(taken.has(p.청원ID))continue;const members=[p];taken.add(p.청원ID)
  for(const c of petitionRelationCandidates(p,petitions,relations).filter(x=>x.documented)){if(!taken.has(c.petition.청원ID)){members.push(c.petition);taken.add(c.petition.청원ID)}}
  result.push({id:'ISSUE-'+members.map(x=>x.청원ID).sort().join('-'),name:p.공통현안키||p.청원제목_원문,petitions:members,evidence:members.length>1?'CSV 연관관계 및 공통 현안 키':'단일 청원 / 미연계'})
 }
 return result
}
export function isOfficialDocument(r:Relation){return r.자료유형!=='관련 청원'&&!r.자료URL?.includes('q_petitSn=')}
export function safeSource(url:string){try{const u=new URL(url);return u.protocol==='https:'||u.protocol==='http:'}catch{return false}}
export function computeMetrics(petitions:Petition[],relations:Relation[]){
 const linked=new Set(relations.filter(r=>safeSource(r.자료URL)).map(r=>r.청원ID))
 const officialDocs=relations.filter(r=>isOfficialDocument(r)&&safeSource(r.자료URL))
 return {total:petitions.length,answered:petitions.filter(p=>p.공식청원상태==='답변완료').length,linked:petitions.filter(p=>linked.has(p.청원ID)).length,verifiedProjects:0,unverified:petitions.filter(p=>p.대시보드_상태==='unverified').length,transferred:petitions.filter(p=>/이첩 확인|이관 확인/.test(p.이첩여부_확인결과)).length,officialDocuments:officialDocs.length,informationRate:petitions.length?Math.round(1000*linked.size/petitions.length)/10:0}
}
