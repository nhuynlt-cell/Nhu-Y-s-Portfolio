import { useState, useEffect } from 'react';
import Portfolio from './components/Portfolio';
import Admin from './components/Admin';
import ProjectModal from './components/ProjectModal';
import { Project, PortfolioContent } from './types';
import { getProjects, getPortfolioContent } from './lib/firebase';

export default function App() {
  const [view, setView] = useState<'portfolio' | 'admin'>('portfolio');
  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<Omit<PortfolioContent, 'projects'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load all data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [projectsData, contentData] = await Promise.all([
          getProjects(),
          getPortfolioContent()
        ]);
        setProjects(projectsData);
        setContent(contentData);
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu từ Firestore:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      {view === 'portfolio' ? (
        <Portfolio 
          projects={projects}
          content={content}
          loading={loading}
          onOpenProject={setSelectedProjectId}
          onOpenAdmin={() => setView('admin')}
        />
      ) : (
        <Admin 
          onBackToPortfolio={() => setView('portfolio')}
          onRefreshPortfolio={handleRefresh}
        />
      )}

      {/* Project Details / Play Modal */}
      <ProjectModal 
        project={selectedProject}
        onClose={() => setSelectedProjectId(null)}
      />
    </div>
  );
}
