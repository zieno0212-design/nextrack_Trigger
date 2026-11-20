import Papa from 'papaparse'

export type Petition = {
  청원ID: string; 청원제목_원문: string; 지역_청원내용기반: string; 분야: string;
  청원시작일: string; 청원마감일: string; 참여인원: string; 공식청원상태: string;
  원본URL: string; 공식답변_핵심요약: string; 공통현안키: string;
  유사청원ID: string; 유사관계_판정: string; 대시보드_상태: string;
  행정조치_공개표시: string; 후속_검증과제: string; 지도표시_적격: string;
  이첩여부_확인결과: string; 조사기준일: string; [key: string]: string
}
export type Relation = {
  청원ID: string; 자료명: string; 연결설명: string; 자료URL: string;
  연결판정: string; 자료유형: string; 주의사항: string;
}
export type Summary = {지표: string; 구분: string; 건수: string; 설명: string}

async function loadCSV<T>(path:string):Promise<T[]> {
  const response = await fetch(path)
  if(!response.ok) throw new Error(`${path} 파일을 찾을 수 없습니다. (${response.status})`)
  const raw=await response.text()
  const parsed=Papa.parse<T>(raw.replace(/^\uFEFF/,''), {header:true,skipEmptyLines:true,transformHeader:(h)=>h.trim()})
  if(parsed.errors.length) throw new Error(`${path}: ${parsed.errors[0].message}`)
  return parsed.data
}
export async function loadData(){
  const [petitions,relations,summary] = await Promise.all([
    loadCSV<Petition>('/data/petitions.csv'), loadCSV<Relation>('/data/relations.csv'),loadCSV<Summary>('/data/dashboard.csv')
  ])
  const ids = new Set(petitions.map(p=>p.청원ID))
  if(ids.size!==petitions.length) throw new Error('중복 청원 ID가 발견되었습니다.')
  const invalid=relations.filter(r=>!ids.has(r.청원ID))
  if(invalid.length) throw new Error(`연결 자료의 청원 ID가 존재하지 않습니다: ${invalid.map(x=>x.청원ID).join(',')}`)
  return {petitions,relations,summary}
}

export function district(p:Petition):string {
  const s=p.지역_청원내용기반
  if(s.includes('수지구')) return '수지구'
  if(s.includes('기흥구')) return '기흥구'
  if(s.includes('처인구')) return '처인구'
  return '지역 확인 필요'
}

const stopwords=new Set(['요청','관련','개선','설치','문제','대한','위한','확인','사업','용인시','해주세요','청원','동천동','수지구','기흥구','처인구','검토','주민'])
function tokens(s:string){return new Set((s.toLowerCase().match(/[가-힣a-z0-9]{2,}/g)||[]).filter(t=>!stopwords.has(t)))}
export function similarity(a:Petition,b:Petition){
  const aT=tokens(`${a.청원제목_원문} ${a.공통현안키}`),bT=tokens(`${b.청원제목_원문} ${b.공통현안키}`)
  const shared=[...aT].filter(x=>bT.has(x)),union=new Set([...aT,...bT]).size
  const textScore=union?shared.length/union:0
  const sameArea=district(a)!=='지역 확인 필요'&&district(a)===district(b)
  const explicit=a.유사청원ID.split(/[;,\s]+/).includes(b.청원ID)||b.유사청원ID.split(/[;,\s]+/).includes(a.청원ID)
  const sameKey=Boolean(a.공통현안키)&&a.공통현안키===b.공통현안키
  const score=Math.min(100,Math.round(textScore*65+(sameArea?8:0)+(sameKey?22:0)+(explicit?35:0)))
  return {score,explicit,sameKey,shared:shared.slice(0,6),sameArea}
}
