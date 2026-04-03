import { useEffect, useState } from 'react';

import { PROFILES } from '../data/PROFILES';
import { type Profile } from '../types';

export type { Profile };
export type ProfileMap = { [key: string]: Profile };

const STORAGE_KEY = 'user_profiles';

// Generate a simple unique key from the label, e.g. "My Role" -> "my_role_1234"
function generateKey(label: string): string {
  const base = label.trim().toLowerCase().replace(/\s+/g, '_');
  return `${base}_${Date.now()}`;
}

function loadFromStorage(): ProfileMap {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // If parsing fails, fall back to defaults
  }
  // First time: use the hardcoded profiles as a starting point
  return PROFILES as ProfileMap;
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<ProfileMap>(loadFromStorage);

  // Save to localStorage whenever profiles change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const addProfile = (profile: Profile): string => {
    const key = generateKey(profile.label);
    setProfiles((prev) => ({ ...prev, [key]: profile }));
    return key; // return the new key so the caller can select it
  };

  const updateProfile = (key: string, profile: Profile) => {
    setProfiles((prev) => ({ ...prev, [key]: profile }));
  };

  const deleteProfile = (key: string) => {
    setProfiles((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  return { profiles, addProfile, updateProfile, deleteProfile };
}
