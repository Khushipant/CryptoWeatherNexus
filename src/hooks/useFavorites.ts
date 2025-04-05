import { useState, useEffect, useCallback } from 'react';

// Type for the hook: either 'city' or 'crypto'
type FavoriteType = 'city' | 'crypto';

const useFavorites = (type: FavoriteType) => {
  const localStorageKey = `${type}_favorites`;
  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites from localStorage on initial mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(localStorageKey);
      if (storedFavorites) {
        const parsedFavorites = JSON.parse(storedFavorites);
        if (Array.isArray(parsedFavorites)) {
             setFavorites(parsedFavorites);
             console.log(`Loaded ${type} favorites from localStorage:`, parsedFavorites);
        } else {
             console.warn(`Invalid ${type} favorites format in localStorage. Resetting.`);
             localStorage.removeItem(localStorageKey); // Clear invalid data
        }
      } else {
          console.log(`No ${type} favorites found in localStorage.`);
      }
    } catch (error) {
      console.error(`Error loading ${type} favorites from localStorage:`, error);
      // Handle cases where localStorage might be disabled or full
    }
  }, [localStorageKey, type]); // Depend on key and type

  // Save favorites to localStorage whenever the state changes
  useEffect(() => {
    try {
      // Avoid saving the initial empty array before loading finishes
      if (favorites.length > 0 || localStorage.getItem(localStorageKey)) {
           localStorage.setItem(localStorageKey, JSON.stringify(favorites));
           console.log(`Saved ${type} favorites to localStorage:`, favorites);
      }
    } catch (error) {
      console.error(`Error saving ${type} favorites to localStorage:`, error);
    }
  }, [favorites, localStorageKey, type]);

  const addFavorite = useCallback((id: string) => {
    if (!favorites.includes(id)) {
      setFavorites(prevFavorites => [...prevFavorites, id]);
    }
  }, [favorites]);

  const removeFavorite = useCallback((id: string) => {
    setFavorites(prevFavorites => prevFavorites.filter(favId => favId !== id));
  }, []);

  const isFavorite = useCallback((id: string): boolean => {
    return favorites.includes(id);
  }, [favorites]);

  const toggleFavorite = useCallback((id: string) => {
      if (isFavorite(id)) {
          removeFavorite(id);
      } else {
          addFavorite(id);
      }
  }, [addFavorite, removeFavorite, isFavorite]);

  return { favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite };
};

export default useFavorites;
