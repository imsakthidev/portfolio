"use client";
import React from 'react';
import { motion, Variants, useScroll, useTransform, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ArrowRight, Mail } from 'lucide-react';
import MagneticWrapper from '@/components/MagneticWrapper/MagneticWrapper';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Hero.module.css';

const ScrambleText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = React.useState(text);
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    setDisplayText(text);
  }, [text]);

  const handleMouseEnter = () => {
    let iteration = 0;
    const chars = "!<>-_\\\\/[]{}—=+*^?#________";
    
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      setDisplayText(
        text.split("").map((letter, index) => {
          if (index < iteration) return text[index];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("")
      );
      
      if (iteration >= text.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      iteration += 1 / 3;
    }, 30);
  };

  const handleMouseLeave = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDisplayText(text);
  };

  return (
    <span 
      onMouseEnter={handleMouseEnter} 
      onMouseLeave={handleMouseLeave}
    >
      {displayText}
    </span>
  );
};

export default function Hero() {
  const { t } = useLanguage();
  const [startAnim, setStartAnim] = React.useState(false);

  React.useEffect(() => {
    const splashShown = sessionStorage.getItem('splashShown');
    if (!splashShown) {
      // 2500ms for splash display + 800ms for splash exit animation = 3300ms
      const timer = setTimeout(() => setStartAnim(true), 3300);
      return () => clearTimeout(timer);
    } else {
      setStartAnim(true);
    }
  }, []);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], ["0%", "50%"]);
  const imageY = useTransform(scrollY, [0, 1000], ["0%", "20%"]);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }
    }
  };

  const splitText = (text: string) => {
    return text.split(' ').map((word, index) => (
      <motion.span 
        key={index} 
        variants={itemVariants} 
        style={{ display: 'inline-block', marginRight: '0.25em' }}
      >
        {word}
      </motion.span>
    ));
  };

  return (
    <section id="home" className={styles.hero} onMouseMove={handleMouseMove}>
      <motion.div 
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          zIndex: 0,
          background: useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(124, 58, 237, 0.15), transparent 80%)`
        }}
      />
      <div className={styles.backgroundEffects}>
        <motion.div style={{ y: backgroundY }} className={styles.glow1}></motion.div>
        <motion.div style={{ y: backgroundY }} className={styles.glow2}></motion.div>
      </div>
      
      <div className={`container ${styles.container}`}>
        <div className={styles.heroGrid}>
          <motion.div 
            className={styles.content}
            initial={{ opacity: 0, y: 30 }}
            animate={startAnim ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className={styles.badge}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={startAnim ? { opacity: 1, scale: 1, y: [0, -5, 0] } : { opacity: 0, scale: 0.8 }}
              transition={startAnim ? { 
                y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.5, delay: 0.2 },
                scale: { duration: 0.5, delay: 0.2 }
              } : { duration: 0.5, delay: 0.2 }}
            >
              {t('hero.badge')}
            </motion.div>
            
            <motion.h1 
              className={styles.title}
              variants={containerVariants}
              initial="hidden"
              animate={startAnim ? "visible" : "hidden"}
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                style={{ display: 'inline-block' }}
              >
                {splitText(t('hero.title1'))} 
                <span className="text-gradient">{splitText(t('hero.title2'))}</span>
              </motion.div>
            </motion.h1>
            
            <motion.p 
              className={styles.subtitle}
              variants={containerVariants}
              initial="hidden"
              animate={startAnim ? "visible" : "hidden"}
            >
              {splitText(t('hero.subtitle'))}
            </motion.p>
            
            <div className={styles.actions}>
              <MagneticWrapper>
                <a href="#projects" className={styles.primaryButton}>
                  <ScrambleText text={t('hero.cta')} /> <ArrowRight size={18} />
                </a>
              </MagneticWrapper>
              <div className={styles.socialLinks}>
                <motion.a whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0px 0px 15px var(--accent-glow)" }} whileTap={{ scale: 0.95 }} href="https://github.com/imsakthidev" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className={styles.socialLink}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path></svg>
                </motion.a>
                <motion.a whileHover={{ scale: 1.1, rotate: -5, boxShadow: "0px 0px 15px var(--accent-glow)" }} whileTap={{ scale: 0.95 }} href="https://www.linkedin.com/in/sakthi-speaks-4bb832313/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className={styles.socialLink}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                </motion.a>
                <motion.a whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0px 0px 15px var(--accent-glow)" }} whileTap={{ scale: 0.95 }} href="https://www.youtube.com/@sakthiispeaks.digital" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className={styles.socialLink}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                </motion.a>
                <motion.a whileHover={{ scale: 1.1, rotate: -5, boxShadow: "0px 0px 15px var(--accent-glow)" }} whileTap={{ scale: 0.95 }} href="https://www.instagram.com/sakthi.speaks.digital/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={styles.socialLink}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </motion.a>
                <a href="mailto:imsakthidev@gmail.com" aria-label="Email" className={styles.socialLink}>
                  <Mail size={22} />
                </a>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className={styles.imageContainer}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={startAnim ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            style={{ y: imageY, position: 'relative' }}
          >
            <img 
              src="/hero-poster.PNG" 
              alt="Sakthi Speaks Digital" 
              className={styles.profileImage} 
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
