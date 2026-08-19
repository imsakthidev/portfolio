"use client";
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AdminProjects from './AdminProjects';
import AdminSkills from './AdminSkills';
import styles from './Admin.module.css';

export default function AdminDashboard() {
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [approvedReviews, setApprovedReviews] = useState<any[]>([]);
  const [pendingFAQs, setPendingFAQs] = useState<any[]>([]);
  const [approvedFAQs, setApprovedFAQs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [queries, setQueries] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    try {
      // Fetch Reviews
      const allReviewsQ = query(collection(db, 'testimonials'));
      const reviewsSnap = await getDocs(allReviewsQ);
      const reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setPendingReviews(reviews.filter(r => r.status === 'pending'));
      setApprovedReviews(reviews.filter(r => r.status === 'approved'));

      // Fetch FAQs
      const allFaqsQ = query(collection(db, 'faqs'));
      const faqsSnap = await getDocs(allFaqsQ);
      const faqs = faqsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setPendingFAQs(faqs.filter(f => f.status === 'pending'));
      setApprovedFAQs(faqs.filter(f => f.status === 'approved'));
      
      // Fetch Users
      const allUsersQ = query(collection(db, 'users'));
      const usersSnap = await getDocs(allUsersQ);
      const fetchedUsers = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Filter out users who have been soft-deleted
      setUsers(fetchedUsers.filter((u: any) => u.status !== 'deleted'));

      // Fetch Queries
      const allQueriesQ = query(collection(db, 'queries'));
      const queriesSnap = await getDocs(allQueriesQ);
      const fetchedQueries = queriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort so newest is first (assuming createdAt exists)
      fetchedQueries.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setQueries(fetchedQueries);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const handleStatusChange = async (collectionName: string, id: string, newStatus: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, { status: newStatus });
      fetchData(); // Refresh lists
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (collectionName: string, id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      const docRef = doc(db, collectionName, id);
      
      if (collectionName === 'users') {
        // Soft delete users so AuthContext doesn't recreate their document on next login
        await updateDoc(docRef, { status: 'deleted' });
      } else {
        await deleteDoc(docRef);
      }
      
      fetchData(); // Refresh lists
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const handlePasswordReset = async (email: string) => {
    if (!email) {
      alert("This user does not have an email address.");
      return;
    }
    if (!confirm(`Send password reset email to ${email}?`)) return;
    
    try {
      await sendPasswordResetEmail(auth, email);
      alert(`Password reset email sent to ${email}`);
    } catch (error: any) {
      console.error("Error sending reset email:", error);
      alert(`Error: ${error.message}`);
    }
  };

  if (authLoading || (user && isAdmin && loadingData)) {
    return <div className={styles.container}>Loading dashboard...</div>;
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title} style={{ color: '#ef4444' }}>Access Denied</h1>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <AdminProjects />
      <AdminSkills />

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          New Inquiries (Contact Form)
          {queries.filter(q => q.status === 'new').length > 0 && <span className={styles.badge} style={{background: '#ef4444'}}>{queries.filter(q => q.status === 'new').length}</span>}
        </h2>
        
        {queries.length === 0 ? (
          <div className={styles.empty}>No new inquiries.</div>
        ) : (
          <div className={styles.list}>
            {queries.map(q => (
              <div key={q.id} className={styles.card} style={{ borderLeft: q.status === 'new' ? '4px solid #ef4444' : '4px solid transparent' }}>
                <div className={styles.content}>
                  <div className={styles.itemTitle}>{q.name}</div>
                  <div className={styles.itemText} style={{ opacity: 1, marginBottom: '8px' }}>
                    <strong>Email:</strong> <a href={`mailto:${q.email}`} style={{color: '#60a5fa'}}>{q.email}</a> <br/>
                    <strong>Mobile:</strong> {q.mobile}
                  </div>
                  <div className={styles.itemText} style={{ padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                    "{q.message}"
                  </div>
                </div>
                <div className={styles.actions}>
                  {q.status === 'new' && (
                     <button onClick={() => handleStatusChange('queries', q.id, 'read')} className={styles.approveBtn} style={{ background: '#3b82f6' }}>Mark as Read</button>
                  )}
                  <button onClick={() => handleDelete('queries', q.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Pending Client Reviews
          {pendingReviews.length > 0 && <span className={styles.badge}>{pendingReviews.length}</span>}
        </h2>
        
        {pendingReviews.length === 0 ? (
          <div className={styles.empty}>No pending reviews.</div>
        ) : (
          <div className={styles.list}>
            {pendingReviews.map(review => (
              <div key={review.id} className={styles.card}>
                <div className={styles.content}>
                  <div className={styles.itemTitle}>{review.name} • {review.role}</div>
                  <div className={styles.itemText}>"{review.review}"</div>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleStatusChange('testimonials', review.id, 'approved')} className={styles.approveBtn}>Approve</button>
                  <button onClick={() => handleDelete('testimonials', review.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Live Client Reviews (Approved)
          {approvedReviews.length > 0 && <span className={styles.badge}>{approvedReviews.length}</span>}
        </h2>
        
        {approvedReviews.length === 0 ? (
          <div className={styles.empty}>No live reviews.</div>
        ) : (
          <div className={styles.list}>
            {approvedReviews.map(review => (
              <div key={review.id} className={styles.card}>
                <div className={styles.content}>
                  <div className={styles.itemTitle}>{review.name} • {review.role}</div>
                  <div className={styles.itemText}>"{review.review}"</div>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleStatusChange('testimonials', review.id, 'pending')} className={styles.deleteBtn}>Hide (Disapprove)</button>
                  <button onClick={() => handleDelete('testimonials', review.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Pending Chatbot Questions (FAQs)
          {pendingFAQs.length > 0 && <span className={styles.badge}>{pendingFAQs.length}</span>}
        </h2>
        
        {pendingFAQs.length === 0 ? (
          <div className={styles.empty}>No pending questions.</div>
        ) : (
          <div className={styles.list}>
            {pendingFAQs.map(faq => (
              <div key={faq.id} className={styles.card}>
                <div className={styles.content}>
                  <div className={styles.itemTitle}>Q: {faq.question}</div>
                  <div className={styles.itemText}>A: {faq.answer}</div>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleStatusChange('faqs', faq.id, 'approved')} className={styles.approveBtn}>Approve</button>
                  <button onClick={() => handleDelete('faqs', faq.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Live FAQs (Approved)
          {approvedFAQs.length > 0 && <span className={styles.badge}>{approvedFAQs.length}</span>}
        </h2>
        
        {approvedFAQs.length === 0 ? (
          <div className={styles.empty}>No live FAQs.</div>
        ) : (
          <div className={styles.list}>
            {approvedFAQs.map(faq => (
              <div key={faq.id} className={styles.card}>
                <div className={styles.content}>
                  <div className={styles.itemTitle}>Q: {faq.question}</div>
                  <div className={styles.itemText}>A: {faq.answer}</div>
                </div>
                <div className={styles.actions}>
                  <button onClick={() => handleStatusChange('faqs', faq.id, 'pending')} className={styles.deleteBtn}>Hide (Disapprove)</button>
                  <button onClick={() => handleDelete('faqs', faq.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Registered Users
          {users.length > 0 && <span className={styles.badge}>{users.length}</span>}
        </h2>
        
        {users.length === 0 ? (
          <div className={styles.empty}>No registered users found.</div>
        ) : (
          <div className={styles.list}>
            {users.map(user => (
              <div key={user.id} className={styles.card}>
                <div className={styles.content}>
                  <div className={styles.itemTitle}>
                    {user.displayName || 'Anonymous'} 
                    {user.status === 'disabled' && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginLeft: '8px' }}>(Disabled)</span>}
                  </div>
                  <div className={styles.itemText}>{user.email || 'No Email'}</div>
                  <div className={styles.itemText} style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                    User ID: {user.uid}
                  </div>
                </div>
                <div className={styles.actions} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '8px' }}>
                   {user.photoURL && (
                     <img 
                       src={user.photoURL} 
                       alt="avatar" 
                       style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} 
                     />
                   )}
                   <button onClick={() => handlePasswordReset(user.email)} className={styles.approveBtn} style={{ background: '#3b82f6', marginLeft: 'auto' }}>
                     Reset Password
                   </button>
                   {user.status === 'disabled' ? (
                     <button onClick={() => handleStatusChange('users', user.id, 'active')} className={styles.approveBtn}>Enable</button>
                   ) : (
                     <button onClick={() => handleStatusChange('users', user.id, 'disabled')} className={styles.deleteBtn}>Disable</button>
                   )}
                   <button onClick={() => handleDelete('users', user.id)} className={styles.deleteBtn}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
