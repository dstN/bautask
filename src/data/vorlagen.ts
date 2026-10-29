// The shifts the sheet can load. Example data, labelled as such on the page; every one shows a case where the
// obvious arithmetic and the correct one part ways.
import type { Schicht } from '../core/abrechnung';

export interface Vorlage {
  id: string;
  titel: string;
  schichten: Schicht[];
}

export const VORLAGEN: readonly Vorlage[] = [
  { id: 'herbst', titel: 'Die längste Nacht', schichten: [{ datum: '24.10.2026', kommen: '22:00', gehen: '06:00', pause: '45' }] },
  { id: 'pause', titel: 'Pause vergessen', schichten: [{ datum: '20.10.2026', kommen: '07:00', gehen: '13:20', pause: '0' }] },
  {
    id: 'ruhe',
    titel: 'Ruhezeit im Frühjahr',
    schichten: [
      { datum: '28.03.2026', kommen: '12:00', gehen: '22:00', pause: '45' },
      { datum: '29.03.2026', kommen: '09:30', gehen: '15:00', pause: '15' },
    ],
  },
  { id: 'doppelt', titel: 'Zweimal 02:30', schichten: [{ datum: '25.10.2026', kommen: '02:30', gehen: '07:00', pause: '0' }] },
  {
    id: 'rundung',
    titel: 'Gerundet',
    schichten: ['19', '20', '21'].map((tag) => ({ datum: `${tag}.10.2026`, kommen: '06:40', gehen: '14:30', pause: '30' })),
  },
  { id: 'lang', titel: 'Zu lang', schichten: [{ datum: '21.10.2026', kommen: '05:30', gehen: '17:00', pause: '30' }] },
];
