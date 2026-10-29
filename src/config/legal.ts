// Who is responsible, and what the server keeps. Name and postal address are the same as on Dustin's other sites
// (source of truth: schlafcast.de/src/config/legal.ts).
export const legal = {
  name: 'Dustin Tramm',
  careOf: 'c/o Impressumservice Dein-Impressum',
  street: 'Stettiner Str. 41',
  city: '35410 Hungen',
  country: 'Deutschland',
  email: 'dustin.tramm@yinside.de',
  // Hosting per Art. 13 (1) e DSGVO; the contract (AVV, Art. 28) exists in the netcup customer account.
  host: { name: 'netcup GmbH', address: 'Daimlerstraße 25, 76185 Karlsruhe, Deutschland' },
  // Must match the Plesk log rotation of bautask.yinside.de: 1 day + interval × (kept files + 1). Dustin, 29 October
  // 2026: daily, as on his other domains (one kept file), so 1 + 1 × 2 = 3 days. Error logs rotate without the day
  // ahead (2 days); the policy states the larger value. If the rotation changes, this changes, and while it is null
  // scripts/vor-dem-deploy.mjs refuses to deploy: never promise fewer days than the server keeps.
  logRetentionDays: 3 as number | null,
  lastUpdated: '2026-10-29',
} as const;
