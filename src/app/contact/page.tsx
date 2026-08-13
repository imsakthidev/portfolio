import Navbar from '@/components/Navbar/Navbar';
import Contact from '@/components/Contact/Contact';

export const metadata = {
  title: 'Contact | Sakthi Speaks',
  description: 'Get in touch with Sakthi Speaks.',
};

export default function ContactPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '80px' }}>
      <Navbar />
      <Contact />
    </main>
  );
}
