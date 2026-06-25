import type { RoomDTO } from './types'

// ============================================================================
//  PHOTOS DES SALLES
// ----------------------------------------------------------------------------
//  Les photos sont désormais de vrais fichiers rattachés à la salle (room.photoUrls),
//  gérés depuis l'espace admin. Les salles d'origine ont leurs photos par défaut
//  injectées en base (migration V6) : elles apparaissent donc dans photoUrls et
//  restent supprimables. Si une salle n'a plus aucune photo, on affiche une image
//  générique neutre (pas de photo "par défaut" qui reviendrait toute seule).
// ============================================================================

// Image neutre affichée quand une salle n'a aucune photo.
const FALLBACK = '/assets/SALLEA_1.jpg'

export function roomPhotos(room: { photoUrls?: string[] }): string[] {
  return room.photoUrls && room.photoUrls.length > 0 ? room.photoUrls : [FALLBACK]
}

export function roomCover(room: RoomDTO | { photoUrls?: string[] }): string {
  return roomPhotos(room)[0]
}
