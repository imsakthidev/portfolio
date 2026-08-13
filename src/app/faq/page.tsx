import Navbar from '@/components/Navbar/Navbar';
import FAQ from '@/components/FAQ/FAQ';

export const metadata = {
  title: 'FAQ | Sakthi Speaks',
  description: 'Frequently asked questions about our services.',
};

export default function FAQPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '80px' }}>
      <Navbar />
      <FAQ />
    </main>
  );
}
