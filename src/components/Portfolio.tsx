import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Project, PortfolioContent } from '../types';
import { db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { 
  Sun, 
  Moon, 
  Play, 
  Send, 
  Lock, 
  CheckCircle,
  ExternalLink,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';

interface PortfolioProps {
  projects: Project[];
  content?: Omit<PortfolioContent, 'projects'> | null;
  loading: boolean;
  onOpenProject: (id: string) => void;
  onOpenAdmin: () => void;
}

function getShowreelEmbedUrl(url: string): string {
  if (!url) return 'https://www.youtube.com/embed/1LdZ2n_R-L4';
  
  // YouTube
  if (url.includes('youtube.com/watch')) {
    const urlObj = new URL(url);
    const videoId = urlObj.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
  }
  if (url.includes('youtube.com/shorts/')) {
    const videoId = url.split('youtube.com/shorts/')[1]?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0` : url;
  }
  return url;
}

import { InstagramEmbed } from 'react-social-media-embed';

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch')) {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get('v');
    } catch {
      return null;
    }
  }
  if (url.includes('youtu.be/')) {
    return url.split('youtu.be/')[1]?.split('?')[0] || null;
  }
  if (url.includes('youtube.com/embed/')) {
    return url.split('youtube.com/embed/')[1]?.split('?')[0] || null;
  }
  if (url.includes('youtube.com/shorts/')) {
    return url.split('youtube.com/shorts/')[1]?.split('?')[0] || null;
  }
  return null;
}

function getVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
  return match ? match[1] : null;
}

function getInstagramId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

interface DirectVideoPlayerProps {
  url: string;
  title: string;
}

function DirectVideoPlayer({ url, title }: DirectVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const [vimeoThumbnail, setVimeoThumbnail] = useState<string | null>(null);

  const youtubeId = getYoutubeId(url);
  const vimeoId = getVimeoId(url);

  useEffect(() => {
    if (vimeoId) {
      fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0] && data[0].thumbnail_large) {
            setVimeoThumbnail(data[0].thumbnail_large);
          }
        })
        .catch(() => {});
    }
  }, [vimeoId]);

  const handlePlayClick = () => {
    setIsPlaying(true);
    setIsIframeLoading(true);
  };

  let embedUrl = '';
  if (youtubeId) {
    embedUrl = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&iv_load_policy=3`;
  } else if (vimeoId) {
    embedUrl = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&badge=0&byline=0&portrait=0&title=0&color=00adef`;
  } else {
    embedUrl = getShowreelEmbedUrl(url);
  }

  // Choose the best thumbnail
  let thumbnailSrc = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80';
  if (youtubeId) {
    const isShortUrl = url.includes('youtube.com/shorts/');
    thumbnailSrc = `https://img.youtube.com/vi/${youtubeId}/${isShortUrl ? 'oar2.jpg' : 'hqdefault.jpg'}`;
  } else if (vimeoId && vimeoThumbnail) {
    thumbnailSrc = vimeoThumbnail;
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black select-none group rounded-t-[var(--radius)]">
      {/* Real-time Loading Spinner overlay when video is buffering */}
      {isIframeLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm transition-all duration-300">
          <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
          <span className="mt-3 font-mono text-[10px] tracking-widest text-white/75 uppercase animate-pulse">
            Đang tải rạp phim...
          </span>
        </div>
      )}

      {/* The Active Playing Video Iframe */}
      {isPlaying && (
        <iframe 
          src={embedUrl} 
          className="absolute inset-0 w-full h-full border-none z-10"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
          onLoad={() => setIsIframeLoading(false)}
          title={title}
        ></iframe>
      )}

      {/* Premium Cinematic Poster Layer (Vimeo-Style) */}
      {(!isPlaying || isIframeLoading) && (
        <div 
          onClick={handlePlayClick}
          className="absolute inset-0 w-full h-full z-0 cursor-pointer overflow-hidden"
        >
          {/* Cover Art Image */}
          <img 
            src={thumbnailSrc}
            alt={title}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (youtubeId) {
                if (target.src.includes('oar2.jpg')) {
                  target.src = `https://img.youtube.com/vi/${youtubeId}/frame0.jpg`;
                } else if (target.src.includes('frame0.jpg')) {
                  target.src = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
                } else if (target.src.includes('maxresdefault')) {
                  target.src = `https://img.youtube.com/vi/${youtubeId}/sddefault.jpg`;
                } else if (target.src.includes('sddefault')) {
                  target.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
                }
              }
            }}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
          />

          {/* Luxury dark vignetted background */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/60 group-hover:from-black/75 group-hover:via-black/20 group-hover:to-black/50 transition-all duration-500 flex flex-col justify-between p-4 md:p-6">
            
            {/* Minimal Top Header like Vimeo */}
            <div className="flex justify-between items-start opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-black/60 text-white/80 backdrop-blur-sm border border-white/5 uppercase tracking-wider">
                {vimeoId ? 'Vimeo Premium' : 'YouTube Cinema'}
              </span>
              <span className="font-mono text-[9px] text-white/60">
                1080P HD
              </span>
            </div>

            {/* Centered Luxury Glassmorphic Play Trigger */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative flex items-center justify-center">
                {/* Dynamic ripple rings */}
                <span className="absolute w-24 h-24 rounded-full bg-[var(--accent)]/15 scale-75 group-hover:scale-110 group-hover:opacity-100 opacity-0 transition-all duration-700 ease-out" />
                <span className="absolute w-20 h-20 rounded-full bg-[var(--accent)]/10 scale-75 group-hover:scale-105 group-hover:opacity-100 opacity-0 transition-all duration-500 ease-out delay-75" />
                
                {/* Core Play Button */}
                <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:bg-[var(--accent)] group-hover:text-black group-hover:border-[var(--accent)]/30">
                  <Play className="w-6 h-6 fill-current translate-x-[2px] transition-transform duration-300" />
                </div>
              </div>
            </div>

            {/* Custom Vimeo-Style Title & Subtitle Info overlay */}
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500 text-left">
              <p className="font-mono text-[9px] text-[var(--accent)] uppercase tracking-widest font-semibold drop-shadow-md">
                {vimeoId ? 'Vimeo Showcase' : 'YouTube Showcase'}
              </p>
              <h4 className="font-heading text-sm md:text-base font-extrabold text-white mt-1 uppercase tracking-wide truncate drop-shadow-md max-w-[85%]">
                {title}
              </h4>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

interface ShowreelItemProps {
  key?: string;
  project: Project;
  idx: number;
}

function ShowreelItem({ project, idx }: ShowreelItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: Math.min(idx * 0.08, 0.4) }}
      className="mt-8 relative bg-[var(--bg-card)] rounded-[var(--radius)] overflow-hidden border border-[var(--border)] shadow-xl"
    >
      {/* Embedded YouTube Iframe Player directly playable on click */}
      <DirectVideoPlayer url={project.embedUrl || project.link} title={project.title} />

      {/* Clean, elegant details panel underneath */}
      <div className="p-6 md:p-8 space-y-6 select-text">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <h3 className="font-heading text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-wide uppercase">
              {project.title}
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-[var(--accent-glow)] text-[var(--accent)] font-semibold border border-[var(--accent)]/20">
                Năm: {project.year}
              </span>
              {project.roles && project.roles.map((role, i) => (
                <span key={i} className="font-mono text-[11px] px-2.5 py-1 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium border border-[var(--border)] uppercase">
                  {role}
                </span>
              ))}
            </div>
          </div>
          
          <div className="font-mono text-xs text-[var(--text-secondary)] flex flex-col gap-3 md:items-end">
            <div>
              <span className="opacity-60">NỀN TẢNG: </span>
              <span className="text-white font-semibold uppercase">{project.platform || 'YouTube'}</span>
            </div>
            
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all text-xs font-medium cursor-pointer"
            >
              {isExpanded ? (
                <>
                  <span>Ẩn mô tả tác phẩm</span>
                  <ChevronUp className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Xem mô tả tác phẩm</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[var(--border)] pt-5"
          >
            <p className="font-body text-base text-[var(--text-secondary)] leading-relaxed font-light whitespace-pre-line">
              {project.description}
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

interface PersonalProjectItemProps {
  key?: string;
  project: Project;
  idx: number;
  className?: string;
}

function PersonalProjectItem({ project, idx, className = '' }: PersonalProjectItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: Math.min(idx * 0.08, 0.4) }}
      className={`bg-[var(--bg-card)] rounded-[var(--radius)] overflow-hidden border border-[var(--border)] shadow-lg flex flex-col h-full hover:border-[var(--accent)]/30 transition-all duration-300 ${className}`}
    >
      {/* Play directly on click using DirectVideoPlayer */}
      <DirectVideoPlayer url={project.embedUrl || project.link} title={project.title} />

      {/* Clean, elegant minimal details underneath */}
      <div className="p-5 flex flex-col flex-grow justify-between select-text space-y-4">
        <div className="space-y-3">
          <h3 className="font-heading text-lg md:text-xl font-extrabold uppercase tracking-wide text-[var(--text)] leading-tight">
            {project.title.toUpperCase()}
          </h3>

          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-[var(--accent-glow)] text-[var(--accent)] font-semibold border border-[var(--accent)]/20">
              Năm: {project.year}
            </span>

            <span className="font-mono text-[10px] px-2.5 py-1 rounded bg-slate-950/40 text-[var(--text-secondary)] font-medium border border-[var(--border)] uppercase">
              {project.platform || 'YouTube'}
            </span>

            {project.roles && project.roles.map((role, i) => (
              <span key={i} className="font-mono text-[10px] px-2.5 py-1 rounded bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium border border-[var(--border)] uppercase">
                {role}
              </span>
            ))}
          </div>
        </div>

        {/* Toggleable Description */}
        <div className="pt-3 border-t border-[var(--border)]/60">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-md bg-[var(--bg-secondary)] hover:bg-[var(--accent-glow)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-all text-xs font-medium cursor-pointer border border-[var(--border)] hover:border-[var(--accent)]/30"
          >
            <span>{isExpanded ? 'Ẩn mô tả tác phẩm' : 'Xem mô tả tác phẩm'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
          </button>

          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-3 text-left overflow-hidden"
            >
              <p className="font-body text-xs text-[var(--text-secondary)] leading-relaxed font-light whitespace-pre-line bg-slate-950/20 p-3 rounded border border-[var(--border)]/40">
                {project.description || 'Chưa có mô tả tác phẩm.'}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Portfolio({ projects, content, loading, onOpenProject, onOpenAdmin }: PortfolioProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [playingInline, setPlayingInline] = useState<string | null>(null);

  // Contact Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Handle dark/light mode
  useEffect(() => {
    const savedTheme = (localStorage.getItem('ny-portfolio-theme') as 'dark' | 'light') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ny-portfolio-theme', newTheme);
  };

  // Intersection observer for active navigation
  useEffect(() => {
    const sections = ['hero', 'showreel', 'social', 'podcast', 'personal', 'about', 'contact'];
    
    const handleScroll = () => {
      let current = 'hero';
      const scrollPos = window.scrollY + 120;

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el && scrollPos >= el.offsetTop) {
          current = sectionId;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Intersection observer for reveal animations
  const revealRefs = useRef<HTMLElement[]>([]);
  revealRefs.current = [];

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    revealRefs.current.forEach((ref) => {
      observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [projects, loading]);

  // Contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Save message to Firestore!
      await addDoc(collection(db, 'contacts'), {
        name,
        email,
        message,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err) {
      console.error('Lỗi khi gửi lời nhắn:', err);
      alert('Không thể gửi lời nhắn, vui lòng thử lại sau.');
    } finally {
      setSubmitting(false);
    }
  };

  // Group projects by category
  const showreelProjs = projects.filter(p => p.category === 'showreel');
  const socialProjs = projects.filter(p => p.category === 'social');
  const podcastProjs = projects.filter(p => p.category === 'podcast');
  const personalProjs = projects.filter(p => p.category === 'personal');

  // Order helper
  const renderVideoCard = (project: Project, ratio: '16-9' | '9-16', index: number = 0) => {
    const ratioClass = ratio === '9-16' ? 'video-thumb-9-16' : 'video-thumb-16-9';
    
    const ytId = getYoutubeId(project.link || project.embedUrl || '');
    const igId = getInstagramId(project.link || project.embedUrl || '');
    
    const isPlaying = playingInline === project.id;
    const isShort = project.category === 'social' || ratio === '9-16';

    let thumbnailSrc = null;
    if (ytId) {
      thumbnailSrc = `https://img.youtube.com/vi/${ytId}/${isShort ? 'oar2.jpg' : 'hqdefault.jpg'}`;
    }

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Since embedding is disabled by the video owner for these specific videos, 
      // we must open them in a new tab directly instead of trying to play inline.
      if (project.id === 'podcast-1' || project.id === 'podcast-2') {
        window.open(project.link || project.embedUrl, '_blank');
      } else {
        setPlayingInline(project.id);
      }
    };

    return (
      <motion.div 
        key={project.id}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.4) }}
        onClick={handleClick}
        className="group relative rounded-[var(--radius)] overflow-hidden cursor-pointer bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-[var(--accent-glow)] select-none"
      >
        <div className={`relative w-full overflow-hidden ${ratioClass}`}>
          {isPlaying ? (
            igId ? (
               <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden bg-white z-10 flex justify-center items-start custom-scrollbar">
                 <InstagramEmbed url={project.link || project.embedUrl || `https://www.instagram.com/reel/${igId}/`} width="100%" />
               </div>
            ) : ytId ? (
              <iframe 
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&iv_load_policy=3`}
                className="absolute inset-0 w-full h-full border-none z-10"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title={project.title}
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-card)] z-10">
                 <p className="text-sm opacity-50">Video format not supported inline</p>
              </div>
            )
          ) : thumbnailSrc ? (
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={thumbnailSrc} 
                alt={project.title}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (ytId) {
                    if (target.src.includes('oar2.jpg')) {
                      target.src = `https://img.youtube.com/vi/${ytId}/frame0.jpg`;
                    } else if (target.src.includes('frame0.jpg')) {
                      target.src = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
                    } else if (target.src.includes('maxresdefault')) {
                      target.src = `https://img.youtube.com/vi/${ytId}/sddefault.jpg`;
                    } else if (target.src.includes('sddefault')) {
                      target.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
                    }
                  }
                }}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                 <div className="w-16 h-16 rounded-full bg-[var(--accent)]/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_35px_var(--accent-glow)] z-10 opacity-0 group-hover:opacity-100 scale-90">
                    <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                 </div>
              </div>
            </div>
          ) : igId ? (
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-white flex justify-center items-start pointer-events-none custom-scrollbar">
               <InstagramEmbed url={project.link || project.embedUrl || `https://www.instagram.com/reel/${igId}/`} width="100%" />
               <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300 flex items-center justify-center z-20">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent)]/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_35px_var(--accent-glow)] z-10 opacity-0 group-hover:opacity-100 scale-90">
                     <Play className="w-6 h-6 fill-white text-white ml-0.5" />
                  </div>
               </div>
            </div>
          ) : (
            <div className="thumb-placeholder group-hover:scale-105 transition-transform duration-500">
              <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_35px_var(--accent-glow)] z-10">
                <Play className="w-6 h-6 fill-white text-white ml-0.5" />
              </div>
              <span className="font-mono text-[11px] text-[var(--text-secondary)] tracking-widest z-10 uppercase font-semibold">
                {project.platform || 'Video'}
              </span>
            </div>
          )}

          <div className="absolute top-4 left-4 font-mono text-[10px] text-white bg-[var(--accent)] px-3 py-1 rounded-sm flex items-center gap-1.5 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-20 font-bold">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            XEM NGAY
          </div>

          <div className="absolute bottom-4 right-4 font-mono text-[10px] text-white bg-slate-950/80 px-2.5 py-0.5 rounded-sm z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            00:04:12:00
          </div>

          <div className="absolute bottom-0 left-0 h-[3px] bg-[var(--accent)] w-0 group-hover:w-full transition-all duration-[2000ms] z-20"></div>
        </div>

        <div className="p-5">
          <h3 className="font-heading text-base md:text-lg font-bold mb-3 uppercase tracking-wide text-[var(--text)] line-clamp-1 group-hover:text-[var(--accent)] transition-colors">
            {project.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[var(--accent-glow)] text-[var(--accent)] font-semibold">
              {project.year}
            </span>
            {project.roles.slice(0, 2).map((role, i) => (
              <span key={i} className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[var(--accent2-glow)] text-[var(--accent2)] font-medium">
                {role}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div 
      className="relative min-h-screen" 
      style={{
        '--font-heading': content?.globalSettings?.headingFont || "'EB Garamond', serif",
        '--font-body': content?.globalSettings?.bodyFont || "'Inter', sans-serif"
      } as React.CSSProperties}
    >
      
      {/* ========== NAV ========== */}
      <nav id="nav" className="fixed top-0 left-0 right-0 z-1000 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border)] transition-colors">
        {/* Subtle Elegant French Flag Tricolor accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#0055A5] via-[#FFFFFF] to-[#E30613]" />
        
        <div className="max-w-[1320px] mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#hero" className="font-brand font-black text-2xl text-[var(--text)] tracking-tighter hover:opacity-80 transition-opacity">
            NY<span className="text-[var(--accent)]">.</span>
          </a>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-7">
            {['showreel', 'social', 'podcast', 'personal', 'about', 'contact'].map((sect) => (
              <li key={sect}>
                <a 
                  href={`#${sect}`}
                  className={`font-mono text-xs uppercase tracking-widest relative pb-1 hover:text-[var(--accent)] transition-colors ${activeSection === sect ? 'text-[var(--accent)] font-bold' : 'text-[var(--text-secondary)]'}`}
                >
                  {sect}
                  {activeSection === sect && (
                    <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[var(--accent)] animate-fade-in"></span>
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] w-11 h-11 rounded-full cursor-pointer flex items-center justify-center text-lg hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] hover:rotate-[30deg] transition-all duration-300 shadow-sm"
              aria-label="Toggle dark/light mode"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-11 h-11 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text)] hover:border-[var(--accent)] shadow-sm"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--bg)] border-b border-[var(--border)] py-6 px-6 space-y-4 animate-slide-down">
            {['showreel', 'social', 'podcast', 'personal', 'about', 'contact'].map((sect) => (
              <a 
                key={sect}
                href={`#${sect}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block font-mono text-sm uppercase tracking-widest text-[var(--text-secondary)] hover:text-[var(--accent)] py-2 border-b border-slate-900/40"
              >
                {sect}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ========== HERO ========== */}
      <section id="hero" className="min-h-screen flex items-center pt-32 pb-20">
        <div className="max-w-[1320px] mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 lg:gap-24 items-start">
            
            {/* INDEX Sidebar */}
            <aside ref={addToRefs} className="reveal-init lg:sticky lg:top-[120px] space-y-4">
              <h3 className="font-mono text-xs text-[var(--accent)] tracking-widest uppercase mb-6 font-bold">MỤC LỤC</h3>
              <ol className="flex flex-row flex-wrap lg:flex-col gap-4">
                {[
                  { num: '01', name: 'Showreel', href: '#showreel' },
                  { num: '02', name: 'Social Content', href: '#social' },
                  { num: '03', name: 'Podcast Editing', href: '#podcast' },
                  { num: '04', name: 'Personal Work', href: '#personal' },
                  { num: '05', name: 'Background', href: '#about' },
                  { num: '06', name: 'Get In Touch', href: '#contact' },
                ].map((item, i) => (
                  <li key={i} className="mr-4 lg:mr-0">
                    <a href={item.href} className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--accent)] hover:translate-x-1.5 transition-all">
                      <span className="font-mono text-[11px] text-[var(--accent)] font-semibold">{item.num}</span> {item.name}
                    </a>
                  </li>
                ))}
              </ol>
            </aside>

            {/* Main Info */}
            <div ref={addToRefs} className="reveal-init flex flex-col gap-10 lg:gap-12">
              <div className="pulse-bullet font-mono text-xs md:text-sm text-[var(--accent)] uppercase tracking-wider pl-4 flex items-center gap-2 font-semibold">
                Video Editor · Đà Nẵng, Việt Nam
              </div>
              <h1 className="font-brand text-5xl md:text-8xl lg:text-9xl font-black leading-[0.85] tracking-tight uppercase text-[var(--text)] relative">
                NHU Y<br />
                <span className="bg-gradient-to-r from-[var(--accent2)] via-[var(--text)] to-[var(--accent)] bg-clip-text text-transparent">NGUYEN</span>
              </h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 font-body">
                <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light">
                  Tôi là video editor chuyên nghiệp với đam mê mãnh liệt trong việc kể câu chuyện bằng ngôn ngữ hình ảnh. Mỗi dự án là một cơ hội vàng giúp biến ý tưởng sáng tạo thành tác phẩm truyền thông đỉnh cao, từ Social content lan tỏa đến phim ngắn nghệ thuật sâu sắc.
                </p>
                <p className="text-base md:text-lg text-[var(--text-secondary)] leading-relaxed font-light">
                  Tập trung sâu sắc vào nhịp điệu cắt dựng (pacing), phối màu điện ảnh (color grading) và thiết kế âm thanh sống động để tạo ra trải nghiệm thị giác ấn tượng nhất, thôi thúc và giữ chân người xem.
                </p>
              </div>

              <div className="mt-6">
                <h4 className="font-mono text-xs text-[var(--text-secondary)] tracking-widest uppercase mb-5 font-bold">CÓ THỂ GIÚP BẠN VỚI</h4>
                <div className="flex flex-wrap gap-2.5">
                  {(content?.skillTags || [
                    'Video Editing', 'Color Grading', 'Sound Design', 'Motion Graphics',
                    'Social Content', 'Podcast Editing', 'Short-form Video', 'Storytelling'
                  ]).map((skill, i) => (
                    <span key={i} className="font-mono text-xs px-4 py-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] hover:text-[var(--accent)] hover:scale-105 transition-all duration-300 cursor-default select-none">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========== SECTION DIVIDER ========== */}
      <div className="py-20 md:py-28 border-y border-[var(--border)] bg-[var(--bg-secondary)] relative overflow-hidden">
        {/* Subtle decorative flag background overlay */}
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-[#0055A5] via-[#FFFFFF] to-[#E30613]" />
        
        <div className="max-w-[1320px] mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-heading text-4xl md:text-6xl font-black text-center text-[var(--text)] tracking-widest uppercase"
          >
            DỰ ÁN NỔI BẬT
          </motion.h2>
          <div className="w-24 h-1 bg-gradient-to-r from-[#0055A5] via-[var(--text-secondary)] to-[#E30613] mx-auto mt-5 rounded" />
        </div>
      </div>

      {/* ========== SHOWREEL SECTION ========== */}
      <section id="showreel" className="py-24 md:py-32">
        <div className="max-w-[1320px] mx-auto px-6">
          <div ref={addToRefs} className="reveal-init section-label pl-4">01 — Showreel</div>
          
          {loading ? (
            <div className="w-full aspect-video rounded-[var(--radius)] bg-[var(--bg-card)] flex items-center justify-center border border-[var(--border)]">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[var(--accent)] animate-spin"></div>
            </div>
          ) : showreelProjs.length > 0 ? (
            showreelProjs.map((project, idx) => (
              <ShowreelItem key={project.id} project={project} idx={idx} />
            ))
          ) : (
            <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-lg text-[var(--text-secondary)] font-body mt-8">
              Chưa cập nhật Showreel chính thức. Thêm dự án trong khu quản trị Admin!
            </div>
          )}
        </div>
      </section>

      {/* ========== SOCIAL / SHORT-FORM ========== */}
      <section id="social" className="py-24 md:py-32">
        <div className="max-w-[1320px] mx-auto px-6">
          <div ref={addToRefs} className="reveal-init section-label pl-4">02 — Social / Short-form</div>
          
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="aspect-[9/16] rounded-lg bg-[var(--bg-card)] animate-pulse border border-[var(--border)]"></div>
              ))}
            </div>
          ) : socialProjs.length > 0 ? (
            <div ref={addToRefs} className="reveal-init grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-8">
              {socialProjs.map((proj, idx) => renderVideoCard(proj, '9-16', idx))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-lg text-[var(--text-secondary)] font-body mt-8">
              Chưa có video short-form nào được thêm.
            </div>
          )}
        </div>
      </section>

      {/* ========== PODCAST / TALK ========== */}
      <section id="podcast" className="py-24 md:py-32">
        <div className="max-w-[1320px] mx-auto px-6">
          <div ref={addToRefs} className="reveal-init section-label pl-4">03 — Podcast / Talk</div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {[1, 2].map(n => (
                <div key={n} className="aspect-video rounded-lg bg-[var(--bg-card)] animate-pulse border border-[var(--border)]"></div>
              ))}
            </div>
          ) : podcastProjs.length > 0 ? (
            <div ref={addToRefs} className="reveal-init grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              {podcastProjs.map((proj, idx) => renderVideoCard(proj, '16-9', idx))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-lg text-[var(--text-secondary)] font-body mt-8">
              Chưa có video podcast hay talkshow nào được thêm.
            </div>
          )}
        </div>
      </section>

      {/* ========== PERSONAL PROJECTS ========== */}
      <section id="personal" className="py-24 md:py-32">
        <div className="max-w-[1320px] mx-auto px-6">
          <div ref={addToRefs} className="reveal-init section-label pl-4">04 — Personal Projects</div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="md:col-span-4 aspect-video rounded-lg bg-[var(--bg-card)] animate-pulse border border-[var(--border)]"></div>
              ))}
            </div>
          ) : personalProjs.length > 0 ? (
            <div ref={addToRefs} className="reveal-init grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
              {personalProjs.map((proj, idx) => {
                const total = personalProjs.length;
                let bentoClass = 'md:col-span-4';
                if (total === 5) {
                  bentoClass = idx < 2 ? 'md:col-span-6' : 'md:col-span-4';
                } else if (total === 4) {
                  bentoClass = 'md:col-span-6';
                }
                
                return (
                  <PersonalProjectItem 
                    key={proj.id} 
                    project={proj} 
                    idx={idx} 
                    className={bentoClass}
                  />
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-lg text-[var(--text-secondary)] font-body mt-8">
              Chưa có dự án cá nhân nào được thêm.
            </div>
          )}
        </div>
      </section>

      {/* ========== ABOUT ========== */}
      <section id="about" className="py-24 md:py-32 bg-[var(--bg-secondary)] border-y border-[var(--border)]">
        <div className="max-w-[1320px] mx-auto px-6">
          <div className="section-label mb-10">05 — Background</div>
          
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[2rem] p-6 md:p-12 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-10 lg:gap-16 items-start">
              
              {/* Portrait image uploaded by user */}
              <div ref={addToRefs} className="reveal-init w-full aspect-[3/4] lg:aspect-auto lg:h-[600px] rounded-[1.5rem] overflow-hidden shadow-lg border border-[var(--border)] bg-slate-900 relative group">
                <img 
                  src="/nhu-y.jpg" 
                  alt="Nhu Y Nguyen" 
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
                />
              </div>

              {/* About bio text */}
              <div ref={addToRefs} className="reveal-init flex flex-col h-full py-2">
                <h2 className="font-heading text-5xl md:text-7xl font-black uppercase tracking-tight text-[var(--text)] flex items-center gap-4 mb-6">
                  {content?.about?.greeting || "Hello! 👋"} <span className="text-4xl md:text-5xl animate-wave origin-bottom-right">👋</span>
                </h2>
                
                <div className="font-body text-base md:text-lg text-[var(--text-secondary)] leading-relaxed space-y-5 font-light">
                  {(content?.about?.bioParagraphs || [
                    "Xin chào, tôi là **Nhu Y Nguyen** — Video Editor đang sinh sống và làm việc tại thành phố biển Đà Nẵng năng động, Việt Nam. Với tâm huyết dựng phim sâu sắc cùng ước mơ kể chuyện bằng ngôn ngữ hình ảnh cuốn hút, tôi liên tục dấn thân để sáng tạo ra những giải pháp đột phá nâng tầm truyền tải thông điệp.",
                    "Dù là các clip ngắn sôi động tăng tương tác, những tập podcast sâu sắc hay phim ngắn đậm tính điện ảnh — tôi cam kết đặt toàn bộ tinh hoa trong việc lựa chọn khoảnh khắc vàng, màu sắc và âm thanh để làm nên giá trị vượt bậc và chất lượng chuyên nghiệp xuất sắc nhất cho đối tác."
                  ]).map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                  <p className="font-medium text-[var(--text)] italic mt-2">
                    {content?.about?.closingMessage || "Hy vọng bạn sẽ thích portfolio của tôi!"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-12 pt-8 border-t border-[var(--border)]">
                  {/* Skill Categories */}
                  {content?.skillCategories?.map((cat, i) => (
                    <div key={i}>
                      <h4 className="font-heading text-xl font-extrabold text-[var(--text)] uppercase mb-6 tracking-wide">{cat.title}</h4>
                      {cat.title.includes("PHẦN MỀM") ? (
                        <div className="grid grid-cols-4 gap-4">
                          {/* CapCut */}
                          <div className="aspect-square bg-black rounded-[1.25rem] flex items-center justify-center shadow-md border border-[var(--border)] hover:scale-105 transition-transform overflow-hidden relative group" title="CapCut">
                            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/capcut-icon.png" alt="CapCut" className="w-[65%] h-[65%] object-contain" referrerPolicy="no-referrer" />
                          </div>
                          {/* Canva */}
                          <div className="aspect-square bg-white rounded-[1.25rem] flex items-center justify-center shadow-md border border-[var(--border)] hover:scale-105 transition-transform overflow-hidden relative group" title="Canva">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/Canva_logo.svg" alt="Canva" className="w-[70%] h-[70%] object-contain" referrerPolicy="no-referrer" />
                          </div>
                          {/* Affinity */}
                          <div className="aspect-square bg-[#a7f175] rounded-[1.25rem] flex items-center justify-center shadow-md border border-[var(--border)] hover:scale-105 transition-transform overflow-hidden relative group" title="Affinity">
                            <img src="/affinity-logo.svg" alt="Affinity" className="absolute inset-0 w-full h-full object-cover scale-[1.12]" />
                          </div>
                          {/* DaVinci Resolve */}
                          <div className="aspect-square bg-black rounded-[1.25rem] flex items-center justify-center shadow-md border border-[var(--border)] hover:scale-105 transition-transform overflow-hidden relative group" title="DaVinci Resolve">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png" alt="DaVinci Resolve" className="absolute inset-0 w-full h-full object-cover scale-[1.05]" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      ) : (
                        <ul className="space-y-4 font-body text-[var(--text-secondary)] text-sm md:text-base">
                          {cat.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span className="text-[var(--accent)] mt-0.5">▸</span> {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )) || (
                    <>
                      <div>
                        <h4 className="font-heading text-xl font-extrabold text-[var(--text)] uppercase mb-6 tracking-wide">PHẠM VI ĐẢM NHẬM</h4>
                        <ul className="space-y-4 font-body text-[var(--text-secondary)] text-sm md:text-base">
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--accent)] mt-0.5">▸</span> Dựng phim hoàn thiện
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--accent)] mt-0.5">▸</span> Cân chỉnh màu sắc
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--accent)] mt-0.5">▸</span> Thiết kế âm thanh
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--accent)] mt-0.5">▸</span> Đồ họa chuyển động
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--accent)] mt-0.5">▸</span> Nội dung ngắn (Short-form)
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-[var(--accent)] mt-0.5">▸</span> Độc thoại & Hội thoại
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-heading text-xl font-extrabold text-[var(--text)] uppercase mb-6 tracking-wide">PHẦN MỀM</h4>
                        <div className="grid grid-cols-4 gap-4">
                          {/* CapCut */}
                          <div className="aspect-square bg-black rounded-[1.25rem] flex items-center justify-center shadow-md border border-[var(--border)] hover:scale-105 transition-transform overflow-hidden relative group" title="CapCut">
                            <img src="https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/capcut-icon.png" alt="CapCut" className="w-[65%] h-[65%] object-contain" referrerPolicy="no-referrer" />
                          </div>
                          {/* Canva */}
                          <div className="aspect-square bg-white rounded-[1.25rem] flex items-center justify-center shadow-md border border-[var(--border)] hover:scale-105 transition-transform overflow-hidden relative group" title="Canva">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/Canva_logo.svg" alt="Canva" className="w-[70%] h-[70%] object-contain" referrerPolicy="no-referrer" />
                          </div>
                          {/* Affinity */}
                          <div className="aspect-square bg-[#a7f175] rounded-[1.25rem] flex items-center justify-center shadow-md border border-[var(--border)] hover:scale-105 transition-transform overflow-hidden relative group" title="Affinity">
                            <img src="/affinity-logo.svg" alt="Affinity" className="absolute inset-0 w-full h-full object-cover scale-[1.12]" />
                          </div>
                          {/* DaVinci Resolve */}
                          <div className="aspect-square bg-black rounded-[1.25rem] flex items-center justify-center shadow-md border border-[var(--border)] hover:scale-105 transition-transform overflow-hidden relative group" title="DaVinci Resolve">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/4/4d/DaVinci_Resolve_Studio.png" alt="DaVinci Resolve" className="absolute inset-0 w-full h-full object-cover scale-[1.05]" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section id="contact" className="py-24 md:py-32">
        <div className="max-w-[1320px] mx-auto px-6">
          <div ref={addToRefs} className="reveal-init section-label pl-4">06 — CV & Contacts</div>
          <h2 ref={addToRefs} className="reveal-init font-heading text-5xl md:text-8xl font-black uppercase leading-none tracking-tighter mt-4 mb-10 text-[var(--text)]">
            LET'S<br /><span className="text-[var(--accent)]">WORK</span><br />TOGETHER
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start mt-8">
            {/* Left Col: Contact Info */}
            <div ref={addToRefs} className="reveal-init space-y-8">
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Email trực tiếp</span>
                <span className="text-xl md:text-2xl font-heading font-extrabold text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                  <a href={`mailto:${content?.contactInfo?.email || 'nguyennhuy.nlt@gmail.com'}`}>{content?.contactInfo?.email || 'nguyennhuy.nlt@gmail.com'}</a>
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Kênh truyền thông TikTok</span>
                <span className="text-xl md:text-2xl font-heading font-extrabold text-[var(--accent2)] hover:text-[var(--accent)] transition-colors">
                  <a href={`https://www.tiktok.com/${content?.contactInfo?.tiktok || '@nhuy_work'}`} target="_blank" rel="noopener noreferrer">{content?.contactInfo?.tiktok || '@nhuy_work'}</a>
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-mono text-[11px] text-[var(--text-secondary)] uppercase tracking-widest font-bold">Vị trí địa lý</span>
                <span className="text-xl md:text-2xl font-heading font-extrabold text-[var(--text)]">
                  {content?.contactInfo?.location || 'Đà Nẵng, Việt Nam'}
                </span>
              </div>
            </div>

            {/* Right Col: Contact Form */}
            <div ref={addToRefs} className="reveal-init bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 md:p-10 shadow-xl">
              {submitted ? (
                <div className="text-center py-10 flex flex-col items-center justify-center gap-4 animate-fade-in">
                  <CheckCircle className="w-16 h-16 text-emerald-500" />
                  <h3 className="font-heading text-xl font-bold uppercase tracking-wide text-emerald-400">
                    CẢM ƠN BẠN RẤT NHIỀU! 🎬
                  </h3>
                  <p className="text-sm font-body text-[var(--text-secondary)] max-w-sm">
                    Lời nhắn của bạn đã được chuyển tới tôi. Tôi sẽ phản hồi sớm nhất có thể. Chúc một ngày tuyệt vời!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-name" className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Tên của bạn</label>
                    <input 
                      type="text" 
                      id="form-name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nhập họ & tên của bạn..." 
                      className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-3.5 px-4 font-body text-base md:text-sm text-[var(--text)] focus:border-[var(--accent)] outline-none transition-all shadow-inner focus:ring-1 focus:ring-[var(--accent)]"
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-email" className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Địa chỉ email</label>
                    <input 
                      type="email" 
                      id="form-email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com" 
                      className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-3.5 px-4 font-body text-base md:text-sm text-[var(--text)] focus:border-[var(--accent)] outline-none transition-all shadow-inner focus:ring-1 focus:ring-[var(--accent)]"
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label htmlFor="form-message" className="font-mono text-[11px] uppercase tracking-wider text-[var(--text-secondary)] font-bold">Lời nhắn chi tiết</label>
                    <textarea 
                      id="form-message" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Chia sẻ về ý tưởng dự án của bạn..." 
                      rows={4}
                      className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-3.5 px-4 font-body text-base md:text-sm text-[var(--text)] focus:border-[var(--accent)] outline-none transition-all resize-y shadow-inner focus:ring-1 focus:ring-[var(--accent)]"
                      required 
                    ></textarea>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full px-10 py-4 bg-[var(--accent)] hover:bg-[var(--accent2)] text-white font-heading font-extrabold text-xs uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-[var(--accent-glow)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-95 duration-300"
                  >
                    <Send className="w-3.5 h-3.5" /> {submitting ? 'Đang gửi...' : 'GỬI LỜI NHẮN →'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-[var(--border)] py-8 mt-12">
        <div className="max-w-[1320px] mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
          <span className="font-mono text-[11px] text-[var(--text-secondary)]">
            {content?.contactInfo?.footerText || '© 2026 Nhu Y Nguyen. All rights reserved.'}
          </span>
          <div className="flex items-center gap-6">
            <button 
              onClick={onOpenAdmin}
              className="font-mono text-[11px] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors flex items-center gap-1 bg-transparent border-none cursor-pointer"
            >
              <Lock className="w-3 h-3" /> Quản trị Admin
            </button>
            <a href="#hero" className="font-mono text-[11px] text-[var(--accent2)] hover:text-[var(--accent)] transition-colors">
              ↑ Back to top
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
