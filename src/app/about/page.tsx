import Navbar from '@/components/Navbar/Navbar';
import About from '@/components/About/About';

export const metadata = {
  title: 'About | Sakthi Speaks',
  description: 'Learn more about Sakthi Speaks and our mission.',
};

export default function AboutPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '80px' }}>
      <Navbar />
      <About />
    </main>
  );
}
