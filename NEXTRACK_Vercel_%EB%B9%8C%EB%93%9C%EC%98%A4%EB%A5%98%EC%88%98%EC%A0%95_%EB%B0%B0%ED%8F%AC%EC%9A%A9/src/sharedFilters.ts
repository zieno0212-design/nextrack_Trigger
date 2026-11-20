export const WATCH_STORAGE='dt-watch-v1'
export const FILTER_EVENT='dudream-area-filter-updated'
export const keywordValues=()=>{try{const raw=JSON.parse(localStorage.getItem(WATCH_STORAGE)||'null');return raw?.active?String(raw.keywords||'').split(/[,，\n]+/).map((s:string)=>s.trim()).filter(Boolean):[]}catch{return []}}
export const sharedKeywordMatch=(text:string,keywords:string[])=>!keywords.length||keywords.some(k=>text.toLowerCase().includes(k.toLowerCase()))
export function broadcastArea(){window.dispatchEvent(new Event(FILTER_EVENT))}
