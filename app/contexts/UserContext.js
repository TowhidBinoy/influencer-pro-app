"use client";

import { createContext, useContext, useState, useEffect } from 'react';

const FRAME_STORAGE_KEY = 'imp_member_profile_frame';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    name: "Alex Rivera",
    email: "alex.rivera@example.com",
    username: "@alexrivera",
    balance: "1,250.00",
    totalEarnings: "4,820.00",
    currentLevel: "Gold Influencer",
    nextLevel: "Platinum Tier",
    progress: 68,
    postsCompleted: 24,
    referralsCount: 12,
  });

  const [profilePicture, setProfilePicture] = useState(null);
  const [selectedFrameId, setSelectedFrameId] = useState('frame-1');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(FRAME_STORAGE_KEY);
      if (stored) setSelectedFrameId(stored);
    } catch (e) {
      // Storage unavailable fallback
    }
  }, []);

  const updateSelectedFrame = (frameId) => {
    setSelectedFrameId(frameId);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(FRAME_STORAGE_KEY, frameId);
      } catch (e) {
        // Storage unavailable fallback
      }
    }
  };

  const updateBalance = (newBalance) => {
    setUserData(prev => ({ ...prev, balance: newBalance }));
  };

  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{
      userData,
      profilePicture,
      setProfilePicture,
      isLoadingProfile,
      updateBalance,
      updateUserData,
      selectedFrameId,
      updateSelectedFrame,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}