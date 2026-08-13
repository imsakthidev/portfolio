import Navbar from '@/components/Navbar/Navbar';
import Projects from '@/components/Projects/Projects';

export const metadata = {
  title: 'Projects | Sakthi Speaks',
  description: 'View our latest projects and case studies.',
};

export default function ProjectsPage() {
  return (
    <main style={{ minHeight: '100vh', paddingBottom: '80px', paddingTop: '80px' }}>
      <Navbar />
      <Projects />
    </main>
  );
}
