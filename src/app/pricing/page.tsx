import Navbar from '@/components/Navbar/Navbar';
import Pricing from '@/components/Pricing/Pricing';

export const metadata = {
  title: 'Pricing | Sakthi Speaks',
  description: 'Explore our services and pricing packages.',
};

export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '80px' }}>
      <Navbar />
      <Pricing />
    </main>
  );
}
