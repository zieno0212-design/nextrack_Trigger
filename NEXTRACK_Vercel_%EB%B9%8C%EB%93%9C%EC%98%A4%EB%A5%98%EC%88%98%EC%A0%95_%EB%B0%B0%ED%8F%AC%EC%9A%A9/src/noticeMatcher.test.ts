import {describe,it,expect} from 'vitest'
import {findNotices,scorePetitionNotice,OFFICIAL_NOTICES,noticeSuggestions,normalizeKorean} from './noticeMatcher'
import type {Petition} from './data'
const p=(id:string,title:string,region:string):Petition=>({청원ID:id,청원제목_원문:title,지역_청원내용기반:region,분야:'행정일반',청원시작일:'',청원마감일:'',참여인원:'',공식청원상태:'답변완료',원본URL:'',공식답변_핵심요약:'',공통현안키:'',유사청원ID:'',유사관계_판정:'',대시보드_상태:'unverified',행정조치_공개표시:'',후속_검증과제:'',지도표시_적격:'',이첩여부_확인결과:'',조사기준일:''})
describe('official notices',()=>{
 it('searches known public notice by number and name',()=>{expect(findNotices('2026-3182')).toHaveLength(1);expect(findNotices('성복동')).toHaveLength(1);expect(findNotices('없는공고')).toHaveLength(0)})
 it('matches verified same-issue petition and does not mark direct causal link',()=>{const result=scorePetitionNotice(p('3972','성복동 분동을 반대합니다.','수지구 성복동'),OFFICIAL_NOTICES[0]);expect(result.score).toBeGreaterThan(30);expect(result.existingEvidence).toBe(true);expect(result.reviewRequired).toBe(true)})
 it('does not recommend unrelated petition',()=>{expect(noticeSuggestions(p('3826','신봉동 마을버스 증차','수지구 신봉동'))).toHaveLength(0)})
 it('normalizes punctuation and whitespace',()=>{expect(normalizeKorean('성복동(분동)')).toBe('성복동 분동')})
})
