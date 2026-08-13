import Navbar from '@/components/Navbar/Navbar';
import Testimonials from '@/components/Testimonials/Testimonials';

export const metadata = {
  title: 'Testimonials | Sakthi Speaks',
  description: 'Read reviews and testimonials from our clients.',
};

export default function TestimonialsPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '80px' }}>
      <Navbar />
      <Testimonials />
    </main>
  );
}
