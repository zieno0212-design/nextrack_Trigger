import type {Petition} from './data'

export type OfficialNotice={
 id:string;number:string;title:string;department:string;publishedAt:string;period:string;
 eventDate?:string;region:string;keywords:string[];sourceType:'official-list';
 sourceUrl:string;localDocument?:string;summary:string;verifiedSource:boolean;
}
export type NoticeCandidate={notice:OfficialNotice;score:number;sharedTerms:string[];geographicMatch:boolean;existingEvidence:boolean;reasons:string[];reviewRequired:boolean}
export const OFFICIAL_NOTICE_LIST='https://eminwon.yongin.go.kr/emwp/gov/mogaha/ntis/web/ofr/action/OfrAction.do?Key=B_Subject&context=NTIS&homepage_pbs_yn=Y&jndinm=OfrNotAncmtEJB&method=selectListOfrNotAncmt&methodnm=selectListOfrNotAncmtHomepage&not_ancmt_se_code=01%2C02%2C03%2C04%2C05&ofr_pageSize=200&pageIndex=1&subCheck=Y'
export const OFFICIAL_NOTICES:OfficialNotice[]=[{
 id:'2026-3182',number:'용인시 공고 제2026-3182호',
 title:'2026년도 행정구역 개편(분동) 성복동 주민설명회(2차) 개최 공고',
 department:'자치분권과',publishedAt:'2026-11-17',period:'2026-11-17 ~ 2026-12-04',eventDate:'2026-12-04',region:'수지구 성복동',
 keywords:['성복동','분동','행정구역','개편','주민설명회','설문조사','주민의견'],sourceType:'official-list',sourceUrl:OFFICIAL_NOTICE_LIST,
 localDocument:'/documents/yongin-notice-2026-3182.hwpx',summary:'주민 설문조사 결과 안내와 추가 의견 청취를 위한 2차 설명회 개최 공고. 2026.12.04. 10:00 예정.',verifiedSource:true,
}]
const stop=new Set(['용인시','시민','청원','관련','개최','요청','대하여','반대합니다','개선','해주시기','행정','분야','검토','추가','제안','공고'])
export function normalizeKorean(input:string){return input.normalize('NFKC').toLowerCase().replace(/[()\[\]{}·,./:;\-_]/g,' ').replace(/\s+/g,' ').trim()}
export function extractKoreanTerms(input:string){return [...new Set((normalizeKorean(input).match(/[가-힣a-z0-9]{2,}/g)||[]).filter(w=>!stop.has(w)))].sort()}
export function scorePetitionNotice(p:Petition,n:OfficialNotice):NoticeCandidate{
 const text=[p.청원제목_원문,p.지역_청원내용기반,p.공통현안키,p.공식답변_핵심요약].join(' ')
 const norm=normalizeKorean(text)
 const noticeTerms=n.keywords.map(normalizeKorean)
 const sharedTerms=noticeTerms.filter(term=>norm.includes(term))
 const geographicMatch=Boolean(p.지역_청원내용기반.includes('성복동')&&n.region.includes('성복동'))
 const topical=sharedTerms.filter(t=>t!=='성복동')
 const existingEvidence=p.청원ID==='3972'&&n.id==='2026-3182'
 // Score is an interpretable recommendation ranking, never probability or an official project link.
 const score=Math.min(100,Math.round((geographicMatch?18:0)+Math.min(50,topical.length*15)+(existingEvidence?27:0)))
 const reasons=[...sharedTerms.map(t=>`공통 현안어: ${t}`)]
 if(geographicMatch)reasons.unshift('지역 일치: 성복동')
 if(existingEvidence)reasons.push('기존 조사자료에서 동일 현안 공식 공고로 연결됨 (직접 청원 후속조치 인과관계 미확인)')
 return {notice:n,score,sharedTerms,geographicMatch,existingEvidence,reasons,reviewRequired:true}
}
export function noticeSuggestions(p:Petition,notices=OFFICIAL_NOTICES){return notices.map(n=>scorePetitionNotice(p,n)).filter(x=>x.score>0).sort((a,b)=>b.score-a.score)}
export function findNotices(query:string,notices=OFFICIAL_NOTICES){const q=normalizeKorean(query);return notices.filter(n=>!q||normalizeKorean([n.title,n.number,n.region,n.department,n.summary].join(' ')).includes(q))}
