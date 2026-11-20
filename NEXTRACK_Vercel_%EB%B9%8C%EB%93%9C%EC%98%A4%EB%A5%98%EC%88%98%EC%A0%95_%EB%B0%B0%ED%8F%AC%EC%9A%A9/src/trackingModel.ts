import type {Petition} from './data'
export type TrackClass='우선 추적'|'검토 후보'|'추적 제외 후보'|'답변 검증 필요'
export type TrackEvidence={date:string;title:string;type:string;url:string;note:string;verified:string}
export type TrackRecord={id:string;promise:string;action:string;deadline:string;status:string;evidence:TrackEvidence[];reason:string}
export const TRACK_RECORDS:Record<string,TrackRecord>={
 "자료-01":{"id": "자료-01", "promise": "공공시행 전환은 현행 요건상 검토가 어렵다. 역삼조합과 정기회의 등 행정지원을 진행하고, 적법한 변경 제안이 접수되는 경우 타당성 검토 예정.", "action": "조합과 정기회의·행정지원 추적. 공공시행 전환 요청과 분리", "deadline": "공식 답변에 명시된 일정만 참고", "status": "답변상 계획 확인 · 후속자료 미확인", "reason": "제공된 공식 답변 전문 발췌에서 조치·협의 표현 확인. 신규 공고·실행 증빙은 아직 연결되지 않음", "evidence": []},
 "자료-02":{"id": "자료-02", "promise": "2026년 8월 사전타당성조사 용역 착수. 다양한 노선과 정거장 위치를 분석하고 수원시와 협의할 계획.", "action": "사전타당성조사 진행 및 노선·정거장 협의", "deadline": "공식 답변에 명시된 일정만 참고", "status": "답변상 계획 확인 · 후속자료 미확인", "reason": "제공된 공식 답변 전문 발췌에서 조치·협의 표현 확인. 신규 공고·실행 증빙은 아직 연결되지 않음", "evidence": []},
 "자료-03":{"id": "자료-03", "promise": "경기도 신규사업 수요조사 시 지역별·노선별 종합 검토 후 사업계획을 제출할 계획.", "action": "경기도 수요조사 시 사업계획 제출 계획", "deadline": "공식 답변에 명시된 일정만 참고", "status": "답변상 계획 확인 · 후속자료 미확인", "reason": "제공된 공식 답변 전문 발췌에서 조치·협의 표현 확인. 신규 공고·실행 증빙은 아직 연결되지 않음", "evidence": []},
 "자료-04":{"id": "자료-04", "promise": "현재 철도공사는 급행 정차가 어렵다는 의견. 용인시는 관계기관에 지속 건의하고 별도 타당성 조사 필요성을 협의할 계획.", "action": "추가 건의·조사 필요성 협의", "deadline": "공식 답변에 명시된 일정만 참고", "status": "답변상 계획 확인 · 후속자료 미확인", "reason": "제공된 공식 답변 전문 발췌에서 조치·협의 표현 확인. 신규 공고·실행 증빙은 아직 연결되지 않음", "evidence": []},
 "자료-05":{"id": "자료-05", "promise": "관계기관의 현재 주거개발 추진계획은 없음. 2040년 용인도시기본계획 수립 중이며, 민간의 구체적 개발계획 제안 시 검토 예정.", "action": "도시기본계획 수립 동향만 추적", "deadline": "공식 답변에 명시된 일정만 참고", "status": "답변상 계획 확인 · 후속자료 미확인", "reason": "제공된 공식 답변 전문 발췌에서 조치·협의 표현 확인. 신규 공고·실행 증빙은 아직 연결되지 않음", "evidence": []},
 "자료-06":{"id": "자료-06", "promise": "경강선 연장 국가철도망 계획 반영 추진, KDI 민자적격성 조사 진행. 연말 계획·조사 결과 발표 전망. 정거장 위치는 후속 단계에서 결정.", "action": "철도망 계획·적격성 조사 결과 추적", "deadline": "공식 답변에 명시된 일정만 참고", "status": "답변상 계획 확인 · 후속자료 미확인", "reason": "제공된 공식 답변 전문 발췌에서 조치·협의 표현 확인. 신규 공고·실행 증빙은 아직 연결되지 않음", "evidence": []},
 "자료-07":{"id": "자료-07", "promise": "소음·비산먼지 현장점검 및 살수 확대 지도, 일부 방음시설 설치. 협의 요청 시 개발 연계 검토, 주민과 지속 소통 계획.", "action": "방음시설·살수차 조치 및 주민 협의", "deadline": "공식 답변에 명시된 일정만 참고", "status": "답변상 계획 확인 · 후속자료 미확인", "reason": "제공된 공식 답변 전문 발췌에서 조치·협의 표현 확인. 신규 공고·실행 증빙은 아직 연결되지 않음", "evidence": []},

 '3952':{id:'3952',promise:'마을버스 29-1번의 배차간격 단축 등 개선방안을 운수사와 협의할 계획. 차량·운수종사자 추가 확보가 단기간에 어렵다는 점도 명시.',action:'29-1번 운수사 협의 및 노선 운영 개선 검토',deadline:'구체적 협의 일정 미공개',status:'공식 답변상 협의 예고 · 후속자료 미확인',reason:'제공된 공식 답변 전문 발췌. 실제 배차 변경·협의 완료를 확인한 자료는 없음',evidence:[]},
 '3972':{id:'3972',promise:'주민설명회를 올해 안으로 추가 개최하여 분동 관련 사항과 설문조사 결과를 공유할 예정',action:'추가 주민설명회 개최',deadline:'2026년 내',status:'후속 공고 확인',reason:'공식 답변의 연내 추가 설명회 계획과 2차 설명회 공고의 대상 지역·조치 유형이 일치',evidence:[{date:'2026-09-21',title:'성복동 분동 반대 청원 시작',type:'청원',url:'https://www.yongin.go.kr/citizen/ctznPetit/BD_selectCtznPetit.do?q_petitSn=3972',note:'2026-10-21 접수 마감, 답변완료 상태 확인',verified:'공식 청원 화면'},{date:'2026-11-17',title:'성복동 주민설명회(2차) 개최 공고',type:'고시·공고',url:'/documents/yongin-notice-2026-3182.hwpx',note:'용인시 공고 제2026-3182호. 12월 4일 오전 10시 개최 예정',verified:'공식 공고문 파일'},{date:'2026-12-04',title:'주민설명회 개최 예정일',type:'예정',url:'/documents/yongin-notice-2026-3182.hwpx',note:'공고에 따른 예정일이며 실제 개최 결과는 아직 확인되지 않음',verified:'미이행 확인 아님'}]},
 '3826':{id:'3826',promise:'마을버스 15-5번이 2026년 7월 1대 증차될 예정',action:'15-5번 마을버스 1대 증차',deadline:'2026년 7월',status:'증차 발표 확인',reason:'공식 답변의 노선번호·증차 규모와 후속 보도의 노선번호·2대→3대 증차 내용이 일치',evidence:[{date:'2026-05-04',title:'신봉동 마을버스 개선 청원 시작',type:'청원',url:'https://www.yongin.go.kr/citizen/ctznPetit/BD_selectCtznPetit.do?q_petitSn=3826',note:'청원 공식 답변에서 15-5번 증차계획 확인',verified:'공식 답변 캡처'},{date:'2026-07 (날짜 재검증 필요)',title:'15-5번 2대에서 3대로 증차 발표 보도',type:'언론보도',url:'https://m.newswho.net/721461',note:'기사 본문에 9일 발표 및 13일부터 증차 예정이라고 기재. 기사의 실제 게시 연월일은 추가 확인 필요',verified:'제공된 기사 본문' }]}
}
const hardNo=/(법령상.{0,12}(불가능|불가)|추진.{0,7}(불가능|불가)|사업.{0,8}(불가능|불가)|권한.{0,7}(없|부재)|계획이 없습니다|계획 없음|강제.{0,7}(불가능|불가))/
const actionWords=/(검토|협의|계획|예정|모니터링|조사|설명회|수립|증차|추진|개선|점검|실시|반영|확대)/
export function classifyPetition(p:Petition):{kind:TrackClass;reason:string;matched:string[]} {
 if(p.청원ID.startsWith('자료-'))return {kind:'검토 후보',reason:'공식 답변 발췌 확보. 청원번호·후속 행정자료 추가 확인 필요',matched:[TRACK_RECORDS[p.청원ID]?.action||'조건부 후속조치']}
 if(p.청원ID==='3952')return {kind:'검토 후보',reason:'29-1번 배차 개선 운수사 협의 계획 확인. 후속 행정자료 미확보',matched:['운수사 협의']}
 if(TRACK_RECORDS[p.청원ID])return {kind:'우선 추적',reason:'제공된 공식 답변과 후속 문서가 연결된 검증 사례',matched:[TRACK_RECORDS[p.청원ID].action]}
 const s=p.공식답변_핵심요약||''
 if(!s||/본문은 확보하지 못|확인 필요|요약이 제공되지/.test(s))return {kind:'답변 검증 필요',reason:'전체 답변 문장이 없어 자동판정 보류',matched:[]}
 const yes=(s.match(actionWords) || [])[0],no=hardNo.test(s)
 if(no&&!yes)return {kind:'추적 제외 후보',reason:'불가·강제 불가 등 제한 문구 확인. 전체 답변으로 재검토 필요',matched:['불가·권한 제한 문구']}
 if(yes)return {kind:'검토 후보',reason:no?'불가 문구와 다른 후속 검토 표현이 함께 있어 조치별 분리 검토 필요':'요약에 후속 검토·계획 표현 존재. 공식 답변 전문 확인 필요',matched:[yes]}
 return {kind:'답변 검증 필요',reason:'후속 행정조치 약속을 요약만으로 확인하지 못함',matched:[]}
}
