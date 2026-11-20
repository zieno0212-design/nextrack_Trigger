import {describe,it,expect} from 'vitest'
import {classifyPetition} from './trackingModel'
import type {Petition} from './data'
const p=(id:string,answer:string)=>({청원ID:id,공식답변_핵심요약:answer} as Petition)
describe('follow-up triage',()=>{
 it('prioritizes manually verified examples',()=>expect(classifyPetition(p('3972','')).kind).toBe('우선 추적'))
 it('does not discard a mixed refusal with an alternative plan',()=>expect(classifyPetition(p('42','도로 개설은 불가능하지만 대체 교통노선을 검토하겠습니다')).kind).toBe('검토 후보'))
 it('flags impossible-only response for review rather than declaring final exclusion',()=>expect(classifyPetition(p('44','법령상 추진이 불가능합니다')).kind).toBe('추적 제외 후보'))
 it('holds missing full answers',()=>expect(classifyPetition(p('45','답변 본문은 확보하지 못했습니다')).kind).toBe('답변 검증 필요'))
})
