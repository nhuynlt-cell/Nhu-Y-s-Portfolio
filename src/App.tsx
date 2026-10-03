import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Portfolio from './components/Portfolio';
import ProjectModal from './components/ProjectModal';
import { Project, PortfolioContent } from './types';
import { getProjects, getPortfolioContent } from './lib/firebase';

// Admin is only needed by the site owner — keep it out of the main bundle
const Admin = lazy(() => import('./components/Admin'));

const WORK_HASH_PREFIX = '#work/';

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

  // Deep link: open a project when the URL hash is #work/<id>
  useEffect(() => {
    const syncFromHash = () => {
      const hash = window.location.hash;
      setSelectedProjectId(hash.startsWith(WORK_HASH_PREFIX) ? decodeURIComponent(hash.slice(WORK_HASH_PREFIX.length)) : null);
    };
    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const openProject = useCallback((id: string | null) => {
    setSelectedProjectId(id);
    const url = `${window.location.pathname}${window.location.search}${id ? WORK_HASH_PREFIX + encodeURIComponent(id) : ''}`;
    window.history.replaceState(null, '', url);
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId) || null;

  // Prev/next navigation stays within the selected project's category
  const siblings = selectedProject ? projects.filter(p => p.category === selectedProject.category) : [];
  const currentIndex = selectedProject ? siblings.findIndex(p => p.id === selectedProject.id) : -1;
  const prevProject = currentIndex > 0 ? siblings[currentIndex - 1] : null;
  const nextProject = currentIndex >= 0 && currentIndex < siblings.length - 1 ? siblings[currentIndex + 1] : null;

  const handleClose = useCallback(() => openProject(null), [openProject]);
  const handlePrev = useCallback(() => prevProject && openProject(prevProject.id), [prevProject, openProject]);
  const handleNext = useCallback(() => nextProject && openProject(nextProject.id), [nextProject, openProject]);

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] transition-colors duration-300">
      {view === 'portfolio' ? (
        <Portfolio
          projects={projects}
          content={content}
          loading={loading}
          onOpenProject={openProject}
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
        project={view === 'portfolio' ? selectedProject : null}
        onClose={handleClose}
        onPrev={prevProject ? handlePrev : undefined}
        onNext={nextProject ? handleNext : undefined}
        position={currentIndex >= 0 ? { index: currentIndex, total: siblings.length } : undefined}
      />
    </div>
  );
}
