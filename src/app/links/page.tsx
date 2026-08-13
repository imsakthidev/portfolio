import Navbar from '@/components/Navbar/Navbar';
import SocialLinks from '@/components/SocialLinks/SocialLinks';

export const metadata = {
  title: 'Links | Sakthi Speaks',
  description: 'Connect with Sakthi Speaks on social media.',
};

export default function LinksPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '80px' }}>
      <Navbar />
      <SocialLinks />
    </main>
  );
}
