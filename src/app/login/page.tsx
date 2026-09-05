"use client";
import React, { useState, useEffect } from 'react';
import { 
  OAuthProvider, signInWithPopup,
  signInWithEmailAndPassword, createUserWithEmailAndPassword,
  RecaptchaVerifier, signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './Login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'default' | 'phone' | 'otp'>('default');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    router.push('/');
  }

  useEffect(() => {
    // Initialize recaptcha when component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const handleAppleLogin = async () => {
    try {
      const provider = new OAuthProvider('apple.com');
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push('/');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      setAuthMode('otp');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await confirmationResult.confirm(verificationCode);
      router.push('/');
    } catch (err: any) {
      setError("Invalid verification code. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Client Portal</h1>
        <p className={styles.subtitle}>Sign in to manage your projects or leave a review.</p>

        {authMode === 'default' && (
          <>
            <div className={styles.providerButtons}>
              <button className={`${styles.btn} ${styles.appleBtn}`} onClick={handleAppleLogin}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16.142 2.664c1.196-1.442 2.002-3.447 1.782-5.45-1.745.07-3.896 1.162-5.116 2.604-1.1 1.282-2.032 3.33-1.776 5.283 1.942.15 3.914-1.006 5.11-2.437zm.864 3.072c-2.31 0-4.045 1.488-5.118 1.488-1.071 0-2.617-1.367-4.402-1.367-2.32 0-4.462 1.348-5.642 3.4-2.39 4.14-.61 10.283 1.725 13.655 1.144 1.656 2.476 3.486 4.3 3.435 1.727-.046 2.392-1.096 4.475-1.096 2.083 0 2.684 1.096 4.498 1.066 1.884-.027 3.033-1.688 4.17-3.35 1.312-1.92 1.85-3.785 1.874-3.882-.04-.017-3.633-1.396-3.66-5.597-.023-3.513 2.883-5.2 3.013-5.28-1.637-2.394-4.168-2.72-5.066-2.793z" transform="translate(3 0)" />
                </svg>
                Continue with Apple
              </button>

              <button className={`${styles.btn} ${styles.phoneBtn}`} onClick={() => setAuthMode('phone')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                Continue with Phone
              </button>
            </div>

            <div className={styles.divider}>or</div>

            <form className={styles.form} onSubmit={handleEmailAuth}>
              <input 
                type="email" 
                placeholder="Email address" 
                className={styles.input} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input 
                type="password" 
                placeholder="Password" 
                className={styles.input} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" className={styles.submitBtn}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <p style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
              {isSignUp ? 'Already have an account? ' : 'New to Sakthi Speaks? '}
              <button 
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontWeight: 600 }}
                onClick={() => setIsSignUp(!isSignUp)}
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </>
        )}

        {authMode === 'phone' && (
          <form className={styles.form} onSubmit={handleSendCode}>
            <button type="button" className={styles.backBtn} onClick={() => setAuthMode('default')}>
              &larr; Back to all options
            </button>
            <input 
              type="tel" 
              placeholder="Phone number (e.g. +1234567890)" 
              className={styles.input} 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <button type="submit" className={styles.submitBtn}>
              Send Verification Code
            </button>
          </form>
        )}

        {authMode === 'otp' && (
          <form className={styles.form} onSubmit={handleVerifyCode}>
            <button type="button" className={styles.backBtn} onClick={() => setAuthMode('phone')}>
              &larr; Back to phone input
            </button>
            <input 
              type="text" 
              placeholder="Enter 6-digit code" 
              className={styles.input} 
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
            <button type="submit" className={styles.submitBtn}>
              Verify Code
            </button>
          </form>
        )}

        {error && <div className={styles.error}>{error}</div>}
      </div>

      {/* Hidden element for ReCaptcha */}
      <div id="recaptcha-container"></div>
    </div>
  );
}

// Add a declaration for the window object to prevent TypeScript errors
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
