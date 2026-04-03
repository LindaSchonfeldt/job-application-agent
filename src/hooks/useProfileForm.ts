import { useState } from 'react';

import { type Profile } from '../types';

interface UseProfileFormOptions {
  addProfile: (profile: Profile) => string;
  updateProfile: (key: string, profile: Profile) => void;
  onNewProfile: (key: string) => void;
}

export function useProfileForm({ addProfile, updateProfile, onNewProfile }: UseProfileFormOptions) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingKey, setEditingKey] = useState<string | null>(null);

  const openAddForm = () => {
    setEditingKey(null);
    setFormOpen(true);
  };

  const openEditForm = (key: string) => {
    setEditingKey(key);
    setFormOpen(true);
  };

  const handleFormSave = (profileData: Profile) => {
    if (editingKey) {
      updateProfile(editingKey, profileData);
    } else {
      const newKey = addProfile(profileData);
      onNewProfile(newKey);
    }
    setFormOpen(false);
    setEditingKey(null);
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditingKey(null);
  };

  return { formOpen, editingKey, openAddForm, openEditForm, handleFormSave, handleFormCancel };
}
