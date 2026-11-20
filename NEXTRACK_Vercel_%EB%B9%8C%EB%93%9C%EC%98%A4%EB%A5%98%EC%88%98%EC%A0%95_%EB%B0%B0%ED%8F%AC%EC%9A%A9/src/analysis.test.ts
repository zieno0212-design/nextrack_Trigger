import {describe,it,expect} from 'vitest'
import {petitionRelationCandidates,groupPublicIssues,computeMetrics,safeSource} from './analysis'
import type {Petition,Relation} from './data'
const p=(id:string,title:string,key:string,ids:string):Petition=>({청원ID:id,청원제목_원문:title,공통현안키:key,유사청원ID:ids,지역_청원내용기반:'수지구 동천동',분야:'문화',청원시작일:'',청원마감일:'',참여인원:'',공식청원상태:'답변완료',원본URL:'https://example.com',공식답변_핵심요약:'',유사관계_판정:'',대시보드_상태:'unverified',행정조치_공개표시:'후속정보 미확인',후속_검증과제:'',지도표시_적격:'',이첩여부_확인결과:'',조사기준일:''})
const petitions=[p('3749','동천배수지 파크골프장 설치 요청','동천배수지 파크골프장','3746'),p('3746','동천배수지 파크골프장 설치 반대','동천배수지 파크골프장','3749'),p('3952','마을버스 개선 요청','버스 연계','3943'),p('3943','마을버스 노선 반대','버스 연계','3952')]
const relations:Relation[]=[{청원ID:'3749',자료명:'회의록',연결설명:'관련 검토',자료URL:'https://example.com/minutes',연결판정:'직접 언급',자료유형:'공식 회의록',주의사항:'완료 증거 아님'}]
describe('source-grounded similarity',()=>{
 it('keeps explicitly linked opposite opinions',()=>{const c=petitionRelationCandidates(petitions[0],petitions,relations).find(x=>x.petition.청원ID==='3746');expect(c?.documented).toBe(true);expect(c?.reviewRequired).toBe(true)})
 it('groups documented same issues without merging original records',()=>{const g=groupPublicIssues(petitions,relations);expect(g.find(x=>x.petitions.some(p=>p.청원ID==='3749'))?.petitions.map(p=>p.청원ID)).toContain('3746');expect(petitions).toHaveLength(4)})
 it('never equates official responses with implementation',()=>{const m=computeMetrics(petitions,relations);expect(m.answered).toBe(4);expect(m.verifiedProjects).toBe(0)})
 it('validates source links',()=>{expect(safeSource('javascript:alert(1)')).toBe(false);expect(safeSource('https://example.com')).toBe(true)})
})
