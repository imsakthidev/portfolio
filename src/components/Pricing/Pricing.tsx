"use client";
import React, { useState } from 'react';
import { Check, Info, Layout, Database, TrendingUp, PenTool, Bot, Code, Video, Megaphone, Smartphone, Star, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import AnimatedTitle from '@/components/AnimatedTitle/AnimatedTitle';
import styles from './Pricing.module.css';

export default function Pricing() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'web' | 'saas' | 'content' | 'services' | 'bundles'>('web');

  const handleGetStarted = (planName: string) => {
    const messageEl = document.getElementById('message') as HTMLTextAreaElement;
    if (messageEl) {
      messageEl.value = `I am interested in the ${planName}.`;
    }
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="section">
      <div className={`container ${styles.container}`}>
        <div className={styles.header}>
          <AnimatedTitle className={styles.title} text="Services & Pricing" />
          <div className={styles.line}></div>
          <p className={styles.subtitle}>
            Personal Brand & Digital Growth Consulting. We build businesses, not just websites.
          </p>
        </div>

        {/* 5-Tab Navigation */}
        <div className={styles.tabsScrollWrapper}>
          <div className={styles.tabsContainer}>
            <div className={styles.tabsWrapper}>
              <button className={`${styles.tab} ${activeTab === 'web' ? styles.activeTab : ''}`} onClick={() => setActiveTab('web')}>
                <Layout size={18} /> Web Development
              </button>
              <button className={`${styles.tab} ${activeTab === 'saas' ? styles.activeTab : ''}`} onClick={() => setActiveTab('saas')}>
                <Database size={18} /> SaaS & Software
              </button>
              <button className={`${styles.tab} ${activeTab === 'content' ? styles.activeTab : ''}`} onClick={() => setActiveTab('content')}>
                <Video size={18} /> Content Packages
              </button>
              <button className={`${styles.tab} ${activeTab === 'services' ? styles.activeTab : ''}`} onClick={() => setActiveTab('services')}>
                <PenTool size={18} /> Digital Services
              </button>
              <button className={`${styles.tab} ${activeTab === 'bundles' ? styles.activeTab : ''}`} onClick={() => setActiveTab('bundles')}>
                <Star size={18} /> Business Bundles
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content with AnimatePresence */}
        <AnimatePresence mode="wait">
          
          {/* 1. WEB DEVELOPMENT TAB */}
          {activeTab === 'web' && (
            <motion.div 
              key="web"
              className={styles.tabContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className={styles.sectionTitle}><Layout size={20} style={{display:'inline', marginRight:'8px'}}/> Website Solutions</h3>
              <motion.div 
                className={styles.cardsGrid}
                initial="hidden" 
                whileInView="show" 
                viewport={{ once: true, margin: "-50px" }} 
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
              >
                <motion.div className={styles.card} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>Starter Portfolio</h3>
                    <div className={styles.planPrice}>₹9,999</div>
                    <p className={styles.planDesc}>Perfect for students and freelancers.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> 1 Responsive Landing Page</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Contact Form & Basic SEO</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> GitHub + Vercel Deployment</li>
                    <li className={styles.feature}><Clock size={16} className={styles.checkIcon} style={{color: '#64748b'}} /> Delivery: 3–5 Days (2 Revisions)</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Starter Portfolio Website')} className={styles.ctaButton}>Get Started</button>
                </motion.div>

                <motion.div className={`${styles.card} ${styles.popularCard}`} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div className={styles.popularBadge}>Most Popular</div>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>Professional Portfolio</h3>
                    <div className={styles.planPrice}>₹19,999</div>
                    <p className={styles.planDesc}>For creators, doctors & personal brands.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Up to 5 Pages (Custom UI/UX)</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Smooth Animations & Resume</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Advanced SEO & Analytics</li>
                    <li className={styles.feature}><Clock size={16} className={styles.checkIcon} style={{color: '#64748b'}} /> Delivery: 5–7 Days (5 Revisions)</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Professional Portfolio Website')} className={styles.ctaButton}>Get Started</button>
                </motion.div>

                <motion.div className={styles.card} variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>Business Website</h3>
                    <div className={styles.planPrice}>₹34,999</div>
                    <p className={styles.planDesc}>For startups and small businesses.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Up to 10 Pages (Premium UI)</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Services, Testimonials, Blog Support</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> WhatsApp & Tech SEO</li>
                    <li className={styles.feature}><Clock size={16} className={styles.checkIcon} style={{color: '#64748b'}} /> Delivery: 7–14 Days (30 Days Support)</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Business Website')} className={styles.ctaButton}>Get Started</button>
                </motion.div>
              </motion.div>

              <div className={styles.cardsGrid} style={{marginTop: '2rem'}}>
                <div className={`${styles.card}`} style={{gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto', textAlign:'center'}}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>⚡ Premium Business Website</h3>
                    <div className={styles.planPrice}>₹59,999<span>+</span></div>
                    <p className={styles.planDesc} style={{margin: '0 auto'}}>For businesses requiring advanced functionality.</p>
                  </div>
                  <ul className={styles.featuresList} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', textAlign:'left'}}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Unlimited Pages & Custom Design</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Admin Dashboard & Database</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> API, Auth, & Email Automation</li>
                    <li className={styles.feature}><Clock size={16} className={styles.checkIcon} style={{color: '#64748b'}} /> Delivery: 2–6 Weeks (3 Months Support)</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Premium Business Website')} className={styles.ctaButton} style={{maxWidth: '300px', margin: '2rem auto 0'}}>Get Custom Quote</button>
                </div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '4rem'}}><Code size={20} style={{display:'inline', marginRight:'8px'}}/> Additional Web Services</h3>
              <div className={styles.servicesGrid}>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Website Redesign</div><div className={styles.servicePrice}>Starts at ₹15,000</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Multilingual Website</div><div className={styles.servicePrice}>Starts at ₹10,000</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Payment Gateway</div><div className={styles.servicePrice}>₹7,500</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Blog Setup</div><div className={styles.servicePrice}>₹4,000</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Pro Email Setup</div><div className={styles.servicePrice}>₹2,000</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Extra Page / Google Analytics</div><div className={styles.servicePrice}>₹1,500 each</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Domain / WhatsApp</div><div className={styles.servicePrice}>₹1,000 each</div></div></div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '4rem'}}><TrendingUp size={20} style={{display:'inline', marginRight:'8px'}}/> Monthly Maintenance</h3>
              <div className={styles.servicesGrid}>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Basic</div><div className={styles.servicePrice}>₹999/month</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Standard</div><div className={styles.servicePrice}>₹1,999/month</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Premium</div><div className={styles.servicePrice}>₹3,999/month</div></div></div>
              </div>
            </motion.div>
          )}

          {/* 2. SAAS DEVELOPMENT TAB */}
          {activeTab === 'saas' && (
            <motion.div 
              key="saas"
              className={styles.tabContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.termsSection} style={{marginBottom: '3rem'}}>
                <h4 className={styles.termsTitle}><Info size={20} className={styles.infoIcon} /> Subscription Model Available!</h4>
                <p className={styles.termsList} style={{opacity: 0.9, lineHeight: 1.6, paddingLeft: '1.5rem'}}>
                  Sometimes you don't want to own the code—you just want to use the software! Instead of a massive upfront cost, ask us about our <strong>Subscription Setup</strong> (Setup Fee: ₹25,000 + Monthly Subscription: ₹999–₹9,999/mo).
                </p>
              </div>

              <h3 className={styles.sectionTitle}><Database size={20} style={{display:'inline', marginRight:'8px'}}/> SaaS Development</h3>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>🟢 MVP SaaS</h3>
                    <div className={styles.planPrice}>₹75,000<span>+</span></div>
                    <p className={styles.planDesc}>Validate your idea quickly.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Auth, Dashboard, Database</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> CRUD Ops & Email Notifications</li>
                    <li className={styles.feature}><Clock size={16} className={styles.checkIcon} style={{color: '#64748b'}} /> 3–6 Weeks (30 Days Support)</li>
                  </ul>
                  <button onClick={() => handleGetStarted('MVP SaaS')} className={styles.ctaButton}>Get Started</button>
                </div>

                <div className={`${styles.card} ${styles.popularCard}`}>
                  <div className={styles.popularBadge}>Growth</div>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>🔵 Professional SaaS</h3>
                    <div className={styles.planPrice}>₹2,00,000<span>+</span></div>
                    <p className={styles.planDesc}>For growing businesses.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Everything in MVP + Payments</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Role-based Access & API</li>
                    <li className={styles.feature}><Clock size={16} className={styles.checkIcon} style={{color: '#64748b'}} /> 6–10 Weeks (60 Days Support)</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Professional SaaS')} className={styles.ctaButton}>Get Started</button>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>🟣 Enterprise SaaS</h3>
                    <div className={styles.planPrice}>₹5,00,000<span>+</span></div>
                    <p className={styles.planDesc}>For larger organizations.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Multi-Tenant & Custom Arch.</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> AI Features & CI/CD Pipeline</li>
                    <li className={styles.feature}><Clock size={16} className={styles.checkIcon} style={{color: '#64748b'}} /> 2–6 Months (90 Days Support)</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Enterprise SaaS')} className={styles.ctaButton}>Get Started</button>
                </div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '4rem'}}><Bot size={20} style={{display:'inline', marginRight:'8px'}}/> Custom Feature Pricing</h3>
              <div className={styles.servicesGrid}>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>AI Integration</div><div className={styles.servicePrice}>₹25k – ₹1L+</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Mobile App API</div><div className={styles.servicePrice}>₹30k – ₹1L+</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Analytics Dashboard</div><div className={styles.servicePrice}>₹20k – ₹60k</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Admin Dashboard</div><div className={styles.servicePrice}>₹20k – ₹60k</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Subscription Billing</div><div className={styles.servicePrice}>₹20k – ₹50k</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>API Integration</div><div className={styles.servicePrice}>₹10k – ₹50k</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Payment Gateway</div><div className={styles.servicePrice}>₹15k – ₹40k</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>File Upload System</div><div className={styles.servicePrice}>₹10k – ₹30k</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Login & Authentication</div><div className={styles.servicePrice}>₹10k – ₹25k</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Notifications (Email/SMS)</div><div className={styles.servicePrice}>₹8k – ₹25k</div></div></div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '4rem'}}><Code size={20} style={{display:'inline', marginRight:'8px'}}/> SaaS Monthly Maintenance</h3>
              <div className={styles.servicesGrid}>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Basic (Bug Fixes, Backups)</div><div className={styles.servicePrice}>₹5,000/month</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Standard (+ Performance)</div><div className={styles.servicePrice}>₹10,000/month</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Premium (+ Feature Updates)</div><div className={styles.servicePrice}>₹20,000+/month</div></div></div>
              </div>
            </motion.div>
          )}

          {/* 3. CONTENT PACKAGES TAB */}
          {activeTab === 'content' && (
            <motion.div 
              key="content"
              className={styles.tabContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className={styles.sectionTitle}><PenTool size={20} style={{display:'inline', marginRight:'8px'}}/> Content Creation Packages</h3>
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>🟢 Starter Creator</h3>
                    <div className={styles.planPrice}>₹15,000<span>/mo</span></div>
                    <p className={styles.planDesc}>Best for local businesses & startups.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> 8 Short Videos & Editing</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Captions & Hashtag Research</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Content Calendar</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> 2 Strategy Calls</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Starter Creator Package')} className={styles.ctaButton}>Get Started</button>
                </div>
                <div className={`${styles.card} ${styles.popularCard}`}>
                  <div className={styles.popularBadge}>Growth</div>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>🔵 Growth Package</h3>
                    <div className={styles.planPrice}>₹30,000<span>/mo</span></div>
                    <p className={styles.planDesc}>Best for personal brands.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> 12-16 Shorts & 2 Long Videos</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Script Writing & Storytelling</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> IG & YT Management</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Weekly Strategy Meeting</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Growth Creator Package')} className={styles.ctaButton}>Get Started</button>
                </div>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>🟣 Premium Brand</h3>
                    <div className={styles.planPrice}>₹60,000<span>+/mo</span></div>
                    <p className={styles.planDesc}>For CEOs, influencers, coaches.</p>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> 20+ Shorts & 4 Long Videos</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Advanced Storytelling & Research</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Complete Social Management</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Unlimited Strategy Calls</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Premium Brand Management')} className={styles.ctaButton}>Get Started</button>
                </div>
              </div>

              <div className={styles.cardsGrid} style={{marginTop: '2rem'}}>
                <div className={`${styles.card} ${styles.popularCard}`} style={{gridColumn: '1 / -1', maxWidth: '800px', margin: '0 auto', textAlign:'center'}}>
                  <div className={styles.popularBadge}>The Ultimate Package</div>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>🎯 Complete Personal Brand</h3>
                    <div className={styles.planPrice}>₹75k–1.5L<span>/mo</span></div>
                  </div>
                  <ul className={styles.featuresList} style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', textAlign:'left'}}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Brand Strategy & Research</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Scripts, Storytelling & Recording Guidance</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Short & Long Video Editing</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> SEO, Publishing & Management</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Complete Personal Brand Package')} className={styles.ctaButton} style={{maxWidth: '300px', margin: '2rem auto 0'}}>Become an Authority</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. DIGITAL SERVICES TAB */}
          {activeTab === 'services' && (
            <motion.div 
              key="services"
              className={styles.tabContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className={styles.sectionTitle}><Video size={20} style={{display:'inline', marginRight:'8px'}}/> Video Editing</h3>
              <div className={styles.servicesGrid}>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Documentary Editing</div><div className={styles.servicePrice}>₹8k – ₹25k / video</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Long Video (10-15m)</div><div className={styles.servicePrice}>₹3k – ₹8k / video</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Premium Shorts</div><div className={styles.servicePrice}>₹2.5k – ₹5k / video</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Short Video</div><div className={styles.servicePrice}>₹800 – ₹2.5k / video</div></div></div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '4rem'}}><PenTool size={20} style={{display:'inline', marginRight:'8px'}}/> Strategy & Writing</h3>
              <div className={styles.servicesGrid}>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Storytelling Script</div><div className={styles.servicePrice}>₹3,000 – ₹10,000</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Script Writing</div><div className={styles.servicePrice}>₹1,500 – ₹5,000</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Content Strategy</div><div className={styles.servicePrice}>₹5,000 – ₹20,000</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Brand Consultation (60m)</div><div className={styles.servicePrice}>₹3,000 – ₹7,500</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Thumbnail Design</div><div className={styles.servicePrice}>₹500 – ₹2,000</div></div></div>
              </div>

              <h3 className={styles.sectionTitle} style={{marginTop: '4rem'}}><Megaphone size={20} style={{display:'inline', marginRight:'8px'}}/> Social Media Management</h3>
              <div className={styles.servicesGrid}>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>YouTube Channel Mgmt</div><div className={styles.servicePrice}>₹12k – ₹30k / month</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>LinkedIn Content Mgmt</div><div className={styles.servicePrice}>₹10k – ₹25k / month</div></div></div>
                <div className={styles.serviceItem}><div><div className={styles.serviceName}>Instagram Mgmt</div><div className={styles.servicePrice}>₹8k – ₹20k / month</div></div></div>
              </div>
            </motion.div>
          )}

          {/* 5. BUSINESS BUNDLES TAB */}
          {activeTab === 'bundles' && (
            <motion.div 
              key="bundles"
              className={styles.tabContent}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className={styles.sectionTitle}><Star size={20} style={{display:'inline', marginRight:'8px'}}/> Website + Branding Bundles</h3>
              <p style={{textAlign: 'center', opacity: 0.8, marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem'}}>
                End-to-end digital transformation packages.
              </p>
              
              <div className={styles.cardsGrid}>
                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>Portfolio Bundle</h3>
                    <div className={styles.planPrice}>₹35,000</div>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Portfolio Website Setup</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> 1 Month Content Creation</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Portfolio Bundle')} className={styles.ctaButton}>Get Started</button>
                </div>

                <div className={`${styles.card} ${styles.popularCard}`}>
                  <div className={styles.popularBadge}>Best Value</div>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>Business Bundle</h3>
                    <div className={styles.planPrice}>₹60,000</div>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Business Website Setup</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> 1 Month Content Creation</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Business Bundle')} className={styles.ctaButton}>Get Started</button>
                </div>

                <div className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3 className={styles.planName}>Complete Brand Launch</h3>
                    <div className={styles.planPrice}>₹1,00,000<span>+</span></div>
                  </div>
                  <ul className={styles.featuresList}>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Premium Website</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Complete Branding</li>
                    <li className={styles.feature}><Check size={18} className={styles.checkIcon} /> Growth Strategy</li>
                  </ul>
                  <button onClick={() => handleGetStarted('Complete Brand Launch')} className={styles.ctaButton}>Get Started</button>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Global Footer: Payment Terms */}
        <div className={styles.termsSection} style={{marginTop: '4rem'}}>
          <h4 className={styles.termsTitle}><Info size={20} className={styles.infoIcon} /> Payment Terms & Policies</h4>
          <ul className={styles.termsList}>
            <li><Check size={16} className={styles.infoIcon} /> 50% advance before the project starts, 50% before final delivery (or monthly in advance for retainers).</li>
            <li><Check size={16} className={styles.infoIcon} /> Free minor bug fixes for 30 days post-delivery (for websites/software).</li>
            <li><Check size={16} className={styles.infoIcon} /> Premium stock assets, paid AI tools, domains, hosting, and ad spend billed separately.</li>
            <li><Check size={16} className={styles.infoIcon} /> GST is extra (if applicable).</li>
          </ul>
        </div>

      </div>
    </section>
  );
}
