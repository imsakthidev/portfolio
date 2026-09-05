"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  globalToast: string;
  setGlobalToast: (msg: string) => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  isLoginModalOpen: false,
  setIsLoginModalOpen: () => {},
  globalToast: '',
  setGlobalToast: () => {},
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [hasShownAutoModal, setHasShownAutoModal] = useState(false);
  const [globalToast, setGlobalToast] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      let userIsAdmin = false;
      const adminEmails = ['imsakthidev@gmail.com'];
      if (process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        adminEmails.push(process.env.NEXT_PUBLIC_ADMIN_EMAIL);
      }
      
      if (currentUser && currentUser.email && adminEmails.includes(currentUser.email)) {
        userIsAdmin = true;
      }
      
      // Save/Check user data to Firestore on login
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          
          // First check if user is disabled or deleted
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const status = data.status;
            
            // Role check from Firestore database ONLY (secure boundary)
            if (data.role === 'admin') {
              userIsAdmin = true;
            }

            if (status === 'disabled' || status === 'deleted') {
              await firebaseSignOut(auth);
              setUser(null);
              setIsAdmin(false);
              setLoading(false);
              if (status === 'disabled') {
                alert("Your account has been disabled by the administrator.");
              } else {
                alert("This account no longer exists.");
              }
              return; // exit the auth loop
            }

            // Update their last login, do NOT write role or status to avoid privilege escalation bugs
            await updateDoc(userRef, {
              displayName: currentUser.displayName || 'Anonymous',
              photoURL: currentUser.photoURL || '',
              lastLogin: serverTimestamp(),
            });
          } else {
            // New user, create initial profile safely
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || 'Anonymous',
              photoURL: currentUser.photoURL || '',
              lastLogin: serverTimestamp(),
              status: 'active',
              role: 'user' // Default to normal user
            });
          }
        } catch (error) {
          console.error("Error saving user data:", error);
        }
      } else {
        setIsAdmin(false);
      }

      setIsAdmin(userIsAdmin);
      setLoading(false);

      // Auto-popup logic after 9 seconds if not logged in
      if (!currentUser && !hasShownAutoModal) {
        const timer = setTimeout(() => {
          if (!auth.currentUser) {
            setIsLoginModalOpen(true);
            setHasShownAutoModal(true);
          }
        }, 9000);
        return () => clearTimeout(timer);
      }
    });

    return () => unsubscribe();
  }, [hasShownAutoModal]);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      logout,
      isLoginModalOpen,
      setIsLoginModalOpen,
      globalToast,
      setGlobalToast,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};
