import { useState, useEffect } from 'react';

const STORAGE_KEY = 'banglejs-sync-enabled';

export function useBangleSync() {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isEnabled));
  }, [isEnabled]);

  const toggle = () => setIsEnabled((prev) => !prev);

  return { isEnabled, toggle };
}
