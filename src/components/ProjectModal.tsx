import { Project } from '../types';
import { X, ExternalLink, Play } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

// Helper to convert standard video URL to embed URL
export function convertToEmbedUrl(url: string): string {
  if (!url) return '';
  
  // YouTube
  if (url.includes('youtube.com/watch')) {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  }
  if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
  }
  
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
    return videoId ? `https://player.vimeo.com/video/${videoId}?autoplay=1` : url;
  }
  
  return url;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  if (!project) return null;

  const embedUrl = convertToEmbedUrl(project.embedUrl || project.link);

  return (
    <div 
      className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-md z-[2000] flex items-start justify-center overflow-y-auto p-4 md:p-10 pt-20"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      id="project-modal"
    >
      <div className="max-w-[900px] w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-2xl p-6 md:p-8 relative animate-[modalIn_0.4s_ease]">
        
        {/* Back Button */}
        <button 
          onClick={onClose}
          className="text-[var(--accent2)] font-mono text-xs flex items-center gap-2 hover:text-[var(--accent)] transition-colors mb-6 cursor-pointer bg-transparent border-none"
        >
          <X className="w-4 h-4" /> Quay lại / Đóng
        </button>

        {/* Video Player Wrap */}
        <div className="aspect-video w-full rounded-[var(--radius)] overflow-hidden bg-[var(--bg)] border border-[var(--border)] mb-8">
          {embedUrl ? (
            <iframe 
              src={embedUrl} 
              className="w-full h-full border-none"
              allow="autoplay; fullscreen; picture-in-picture" 
              allowFullScreen
              title={project.title}
            ></iframe>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-900/40 text-center p-6">
              <div className="w-14 h-14 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg">
                <Play className="w-6 h-6 fill-white text-white ml-0.5" />
              </div>
              <span className="font-mono text-sm text-[var(--text-secondary)]">
                Chưa cấu hình Link Video nhúng
              </span>
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 text-xs font-mono px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] hover:border-[var(--accent)] text-[var(--accent2)] hover:text-[var(--accent)] rounded transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Xem trên trình duyệt
                </a>
              )}
            </div>
          )}
        </div>

        {/* Metadata Details */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-[var(--text)]">
              {project.title}
            </h2>
            <div className="flex flex-wrap gap-2 mt-3">
              {project.roles.map((role, i) => (
                <span key={i} className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--accent2-glow)] text-[var(--accent2)]">
                  {role}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="text-sm font-mono text-[var(--accent)] bg-[var(--accent-glow)] px-3 py-1 rounded">
              Năm: {project.year}
            </span>
            {project.platform && (
              <span className="text-xs font-mono text-[var(--text-secondary)]">
                Nền tảng: {project.platform}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed mb-6 font-body whitespace-pre-line">
          {project.description}
        </p>

        {/* Action Link */}
        {project.link && (
          <a 
            href={project.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-mono text-[var(--accent2)] hover:text-[var(--accent)] transition-colors mt-2"
          >
            Xem trên {project.platform || 'Nền tảng chính'} <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
}
