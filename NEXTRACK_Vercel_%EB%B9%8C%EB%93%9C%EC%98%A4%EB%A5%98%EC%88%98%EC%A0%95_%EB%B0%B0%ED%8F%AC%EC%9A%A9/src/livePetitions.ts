export type LivePetition={id:string;title:string;start:string;deadline:string;status:string;gu:string;dong:string;url:string;source:string;verifiedAt:string}
export type LiveResponse={ok:boolean;items:LivePetition[];checkedAt?:string;source:string;error?:string;collection?:string}
export async function getLivePetitions(signal?:AbortSignal):Promise<LiveResponse>{const r=await fetch('/api/petitions/live',{signal});const x=await r.json() as LiveResponse;if(!r.ok||!x.ok)throw new Error(x.error||'공식 청원 목록을 조회할 수 없습니다.');return x}
