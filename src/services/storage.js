import { seedData } from '../data/seedData.js';

export const STORAGE_KEY = 'IP_RJP_PROFESSIONAL_25';

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(seedData);
    const stored = JSON.parse(raw);
    return {
      ...structuredClone(seedData),
      ...stored,
      profile: { ...seedData.profile, ...(stored.profile || {}) },
      vehicles: stored.vehicles?.length ? stored.vehicles : seedData.vehicles,
      places: stored.places?.length ? stored.places : seedData.places,
      activityTypes: stored.activityTypes?.length ? stored.activityTypes : seedData.activityTypes,
      trips: stored.trips || [],
      guards: stored.guards || [],
      activities: stored.activities || [],
      outlook: { ...seedData.outlook, ...(stored.outlook || {}) }
    };
  } catch {
    return structuredClone(seedData);
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function backupData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `IP_RJP_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}
