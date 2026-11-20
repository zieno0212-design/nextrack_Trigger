import type {Petition} from './data'
// 용인시 공식 행정안내도(2026-11-20 확인): 행정읍면동 기준.
export const DONGS: Record<string, string[]> = {
 '수지구':['풍덕천1동','풍덕천2동','신봉동','죽전1동','죽전2동','죽전3동','동천동','상현1동','상현2동','상현3동','성복동'],
 '기흥구':['신갈동','영덕1동','영덕2동','구갈동','상갈동','보라동','기흥동','서농동','구성동','마북동','동백1동','동백2동','동백3동','상하동','보정동'],
 '처인구':['포곡읍','모현읍','이동읍','남사읍','양지읍','원삼면','백암면','중앙동','역북동','삼가동','유림1동','유림2동','동부동']
}
export const GU=['전체','수지구','기흥구','처인구'] as const
export const AREA_STORAGE='dt-selected-local-area-v1'
export type LocalArea={region:string;dong:string}
export function readArea():LocalArea {
 try {const x=JSON.parse(localStorage.getItem(AREA_STORAGE)||'null');if(x&&typeof x.region==='string'&&typeof x.dong==='string' && (x.region==='전체'||DONGS[x.region]) && (!x.dong||DONGS[x.region]?.includes(x.dong)))return x} catch {}
 return {region:'전체',dong:''}
}
export function writeArea(area:LocalArea){try{localStorage.setItem(AREA_STORAGE,JSON.stringify(area));window.dispatchEvent(new Event('dudream-area-filter-updated'))}catch{}}
export function matchesArea(region:string,dong:string,itemRegion:string,itemDong:string){return (region==='전체'||region===itemRegion)&&(!dong||itemDong===dong)}
// 법정동 이름만 있는 자료는 특정 숫자 행정동으로 임의 배정하지 않음.
export function matchesPetitionDong(p:Petition,dong:string){
 if(!dong)return true
 const text=[p.지역_청원내용기반,p.청원제목_원문].join(' ')
 return text.includes(dong)
}
