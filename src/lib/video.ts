import type { SyntheticEvent } from 'react';

// Shared helpers for parsing video URLs (YouTube / Vimeo / Instagram)

export function getYoutubeId(url: string): string | null {
  if (!url) return null;
  if (url.includes('youtube.com/watch')) {
    try {
      return new URL(url).searchParams.get('v');
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

export function getVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/);
  return match ? match[1] : null;
}

export function getInstagramId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/instagram\.com\/(?:reel|p)\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

// Build an autoplaying embed URL for the given video link
export function getEmbedUrl(url: string, autoplay = true): string {
  const ap = autoplay ? 1 : 0;
  const ytId = getYoutubeId(url);
  if (ytId) {
    return `https://www.youtube.com/embed/${ytId}?autoplay=${ap}&controls=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1`;
  }
  const vimeoId = getVimeoId(url);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=${ap}&badge=0&byline=0&portrait=0&title=0`;
  }
  return url;
}

export function getYoutubeThumb(id: string, vertical: boolean): string {
  return `https://img.youtube.com/vi/${id}/${vertical ? 'oar2.jpg' : 'hqdefault.jpg'}`;
}

// Walk through progressively more common YouTube thumbnail variants when one 404s
export function handleYoutubeThumbError(e: SyntheticEvent<HTMLImageElement>, id: string | null) {
  if (!id) return;
  const target = e.currentTarget;
  if (target.src.includes('oar2.jpg')) {
    target.src = `https://img.youtube.com/vi/${id}/frame0.jpg`;
  } else if (target.src.includes('frame0.jpg')) {
    target.src = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  } else if (target.src.includes('maxresdefault')) {
    target.src = `https://img.youtube.com/vi/${id}/sddefault.jpg`;
  } else if (target.src.includes('sddefault')) {
    target.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  }
}

// Videos whose owners disabled embedding — these must open on the platform directly
export const EMBED_DISABLED_IDS = new Set(['podcast-1', 'podcast-2']);
