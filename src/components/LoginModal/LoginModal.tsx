"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  signInWithPopup, GoogleAuthProvider,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile,
  sendEmailVerification, signOut
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { X, Eye, EyeOff } from 'lucide-react';
import styles from './LoginModal.module.css';

export default function LoginModal() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { user, isLoginModalOpen, setIsLoginModalOpen, setGlobalToast } = useAuth();

  if (!isLoginModalOpen) return null;

  const handleClose = () => {
    setError('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setIsLoginModalOpen(false);
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccessMsg('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setGlobalToast('Signed in with Google successfully!');
      handleClose();
    } catch (err: any) {
      console.error("Firebase Auth Error (Google):", err.code, err.message);
      if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized for Google Sign-In. The site admin must add it in Firebase Console -> Authentication -> Settings -> Authorized domains.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Sign-in popup was closed before completing.");
      } else {
        setError("Unable to load your account information. Please try signing in again.");
      }
    }
  };
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Strictly enforce a standard valid email domain (e.g. username@gmail.com)
    // This rejects junk domains like .zz or .cc
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|in|edu|gov|co)$/i;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g., username@gmail.com)");
      return;
    }

    if (isSignUp) {
      if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
      }
      if (!/[A-Z]/.test(password)) {
        setError("Password must contain at least one uppercase letter.");
        return;
      }
      if (!/[a-z]/.test(password)) {
        setError("Password must contain at least one lowercase letter.");
        return;
      }
      if (!/[0-9]/.test(password)) {
        setError("Password must contain at least one number.");
        return;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        setError("Password must contain at least one special character.");
        return;
      }
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Set the display name
        await updateProfile(userCredential.user, { displayName: name });
        
        // Send verification email
        await sendEmailVerification(userCredential.user);
        
        // Save to Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          displayName: name,
          email: userCredential.user.email || null,
          status: 'active',
          role: 'user',
          uid: userCredential.user.uid,
          lastLogin: serverTimestamp()
        }, { merge: true });

        // Immediately sign them out so they must verify
        await signOut(auth);

        setSuccessMsg('Please confirm your email first. Open the confirmation link we emailed you, then log in here.');
        // Switch to sign in view so they can log in later
        setIsSignUp(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Check if email is verified (Google users bypass this automatically, email/pass users must verify)
        if (!userCredential.user.emailVerified) {
          await signOut(auth);
          setSuccessMsg('Please confirm your email first. Open the confirmation link we emailed you, then log in here.');
          return;
        }

        setGlobalToast('Signed in successfully!');
        handleClose();
      }
    } catch (err: any) {
      console.error("Firebase Auth Error (Email):", err.code, err.message);
      if (err.code === 'auth/email-already-in-use') {
        setSuccessMsg('Please confirm your email first. Open the confirmation link we emailed you, then log in here.');
        setIsSignUp(false);
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/invalid-login-credentials' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again or create an account.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Access to this account has been temporarily disabled due to many failed login attempts. Please try again later.');
      } else {
        // Only show generic error if it's an internal error or something unexpected
        setError(err.message || "Unable to load your account information. Please try signing in again.");
      }
    }
  };
  return (
    <AnimatePresence>
      <motion.div 
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className={styles.modal}
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>
          
          <h1 className={styles.title}>Login</h1>
          <p className={styles.subtitle}>Sign in to manage your projects or leave a review.</p>

          <div className={styles.providerButtons}>
            <button className={`${styles.btn} ${styles.googleBtn}`} onClick={handleGoogleLogin}>
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className={styles.divider}>or</div>

          <form className={styles.form} onSubmit={handleEmailAuth}>
            {isSignUp && (
              <input 
                type="text" 
                placeholder="Full Name" 
                className={styles.input} 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            <input 
              type="email" 
              placeholder="Email address" 
              className={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className={styles.eyeButton} 
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button type="submit" className={styles.submitBtn}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
            {isSignUp ? 'Already have an account? ' : 'New to Sakthi Speaks? '}
            <button 
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMsg('');
              }}
              type="button"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>

          <div className={styles.messageContainer}>
            {error && <div className={styles.error}>{error}</div>}
            
            <AnimatePresence>
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -5 }} 
                  animate={{ opacity: 1, scale: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95, y: -5 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ 
                    padding: '1rem', 
                    backgroundColor: 'rgba(234, 179, 8, 0.1)', 
                    color: '#eab308', 
                    borderRadius: '12px', 
                    fontSize: '0.95rem', 
                    textAlign: 'center', 
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    fontWeight: 500,
                    lineHeight: '1.4'
                  }}
                >
                  {successMsg}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
