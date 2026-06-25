import type { RoomDTO } from './types'

// ============================================================================
//  PHOTOS DES SALLES
// ----------------------------------------------------------------------------
//  Clé = nom EXACT de la salle en BDD (colonne `name` dans `rooms`).
//  Valeur = liste de photos. La 1re est la couverture, les suivantes alimentent
//  les thumbnails de la page détail.
//
//  Pour modifier :
//   1. Mets ta photo dans `frontend/public/assets/`
//   2. Ajoute ou édite une ligne ci-dessous avec le nom exact de la salle
//   3. Sauvegarde → Vite recharge la page tout seul
// ============================================================================

const PHOTOS_BY_NAME: Record<string, string[]> = {

  'Amphi A':         ['/assets/AMPHI1.png',     '/assets/AMPHI2.png',     '/assets/AMPHI3.png',     '/assets/AMPHI4.png'],

  'Salle 101 - Lab': ['/assets/SALLEB_1.jpg',   '/assets/SALLEB_2.jpg',   '/assets/SALLEB_3.jpg',   '/assets/SALLEB_4.jpg'],

  'Salle 204':       ['/assets/SALLE204_1.png', '/assets/SALLE204_2.png', '/assets/SALLE204_3.png', '/assets/SALLE204_4.png'],

  'Box Réunion 1':   ['/assets/BOXREU1.png',    '/assets/BOXREU2.png',    '/assets/BOXREU3.png',    '/assets/BOXREU4.png'],

  'Box Réunion 2':   ['/assets/SALLEA_1.jpg',    '/assets/SALLEA_2.jpg',    '/assets/SALLEA_3.jpg',    '/assets/SALLEA_4.jpg'],

}

// Photo affichée si la salle n'a pas d'entrée ci-dessus.
const FALLBACK = '/assets/SALLEA_1.jpg'

// Les photos uploadées par l'admin (room.photoUrls) ont la priorité. À défaut, on
// retombe sur le mapping statique par nom, puis sur l'image générique.
export function roomPhotos(room: { name: string; photoUrls?: string[] }): string[] {
  if (room.photoUrls && room.photoUrls.length > 0) return room.photoUrls
  return PHOTOS_BY_NAME[room.name] ?? [FALLBACK]
}

export function roomCover(room: RoomDTO | { name: string; photoUrls?: string[] }): string {
  return roomPhotos(room)[0]
}