import type { Relation } from './data'

export function getEvidenceSummary(relations: Relation[], petitionId: string) {
  const linked = relations.filter(r => r.청원ID === petitionId)
  const administrative = linked.filter(r => r.자료유형 !== '공식 청원')
  const otherPetitions = linked.filter(r => r.자료유형 === '공식 청원')
  const linkedAdministrativeSources = administrative.filter(r => /^https:\/\//i.test(r.자료URL || ''))
  return { linked, administrative, otherPetitions, linkedAdministrativeSources }
}
