import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Project } from '../types';
import { X, ExternalLink, ChevronLeft, ChevronRight, Link2, Check, Loader2 } from 'lucide-react';
import { getEmbedUrl } from '../lib/video';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  position?: { index: number; total: number };
}

// Helper to convert standard video URL to embed URL
export function convertToEmbedUrl(url: string): string {
  if (!url) return '';
  return getEmbedUrl(url, true);
}

export default function ProjectModal({ project, onClose, onPrev, onNext, position }: ProjectModalProps) {
  const [copied, setCopied] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Keyboard navigation + lock background scroll while open
  useEffect(() => {
    if (!project) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && onPrev) onPrev();
      else if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [project, onClose, onPrev, onNext]);

  useEffect(() => {
    setIframeLoading(true);
    setCopied(false);
  }, [project?.id]);

  const handleCopyLink = async () => {
    if (!project) return;
    const url = `${window.location.origin}${window.location.pathname}#work/${project.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Sao chép liên kết:', url);
    }
  };

  const embedUrl = project ? convertToEmbedUrl(project.embedUrl || project.link) : '';
  const isVertical = project?.ratio === '9-16';

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-xl z-[2000] flex items-start md:items-center justify-center overflow-y-auto p-4 md:p-8"
          onClick={(e) => e.target === e.currentTarget && onClose()}
          id="project-modal"
          role="dialog"
          aria-modal="true"
          aria-label={project.title}
        >
          {/* Prev / Next arrows (desktop) */}
          {onPrev && (
            <button
              onClick={onPrev}
              aria-label="Video trước"
              className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] items-center justify-center text-[var(--text)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all cursor-pointer z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              aria-label="Video tiếp theo"
              className="hidden md:flex fixed right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] items-center justify-center text-[var(--text)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all cursor-pointer z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] overflow-hidden shadow-2xl relative my-auto ${
              isVertical ? 'max-w-[960px] md:grid md:grid-cols-[minmax(0,380px)_1fr]' : 'max-w-[980px]'
            }`}
          >
            {/* Video Player */}
            <div className={`relative w-full bg-black ${isVertical ? 'aspect-[9/16] max-w-[calc(78vh*9/16)] mx-auto' : 'aspect-video'}`}>
              {embedUrl ? (
                <>
                  {iframeLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                    </div>
                  )}
                  <iframe
                    src={embedUrl}
                    className="absolute inset-0 w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    onLoad={() => setIframeLoading(false)}
                    title={project.title}
                  ></iframe>
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-white/60">
                  Chưa cấu hình Link Video nhúng
                </div>
              )}
            </div>

            {/* Metadata Details */}
            <div className="p-6 md:p-8 flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[var(--text-secondary)]">
                  {position ? `${String(position.index + 1).padStart(2, '0')} / ${String(position.total).padStart(2, '0')}` : project.category}
                </span>
                <button
                  onClick={onClose}
                  aria-label="Đóng"
                  className="w-9 h-9 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors cursor-pointer bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h2 className="font-heading text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-[var(--text)] leading-tight">
                {project.title}
              </h2>

              <div className="flex flex-wrap gap-2">
                <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[var(--accent-glow)] text-[var(--accent)] font-semibold">
                  {project.year}
                </span>
                {project.platform && (
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-secondary)] uppercase">
                    {project.platform}
                  </span>
                )}
                {project.roles.map((role, i) => (
                  <span key={i} className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded bg-[var(--accent2-glow)] text-[var(--accent2)]">
                    {role}
                  </span>
                ))}
              </div>

              {project.description && (
                <p className="text-[var(--text-secondary)] text-sm md:text-base leading-relaxed font-body whitespace-pre-line">
                  {project.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-4 mt-auto border-t border-[var(--border)]">
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                  >
                    Xem trên {project.platform || 'nền tảng gốc'} <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 text-xs font-mono px-4 py-2.5 rounded-lg border border-[var(--border)] text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer bg-transparent"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
                  {copied ? 'Đã sao chép!' : 'Chia sẻ'}
                </button>
              </div>

              {/* Prev / Next (mobile) */}
              {(onPrev || onNext) && (
                <div className="flex md:hidden justify-between gap-3">
                  <button onClick={onPrev} disabled={!onPrev} className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-mono py-2.5 rounded-lg border border-[var(--border)] text-[var(--text)] disabled:opacity-30 bg-transparent">
                    <ChevronLeft className="w-4 h-4" /> Trước
                  </button>
                  <button onClick={onNext} disabled={!onNext} className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-mono py-2.5 rounded-lg border border-[var(--border)] text-[var(--text)] disabled:opacity-30 bg-transparent">
                    Sau <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <p className="hidden md:block font-mono text-[10px] text-[var(--text-secondary)] opacity-60">
                Phím tắt: ← → để chuyển video · Esc để đóng
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
