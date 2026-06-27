'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { VideoResult } from '@/lib/types';

interface VideoCardProps {
  video: VideoResult;
}

export default function VideoCard({ video }: VideoCardProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <div className="rounded-xl overflow-hidden border border-brand-border bg-black aspect-video relative">
        <iframe
          src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
        <button
          onClick={() => setPlaying(false)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80 transition-colors"
        >
          ✕
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="w-full text-left rounded-xl overflow-hidden border border-brand-border bg-brand-card hover:border-brand-accent/40 transition-all group"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-brand-border overflow-hidden">
        {video.thumbnail ? (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🎥</div>
        )}
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
          <div className="w-12 h-12 rounded-full bg-brand-accent/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-white text-xl ml-0.5">▶</span>
          </div>
        </div>
        {/* YouTube badge */}
        <div className="absolute bottom-2 right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
          YT
        </div>
      </div>

      {/* Meta */}
      <div className="p-3 flex flex-col gap-1">
        <p className="text-brand-text text-sm font-medium leading-snug line-clamp-2 group-hover:text-brand-accent transition-colors">
          {video.title}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-brand-muted text-xs">{video.channelTitle}</span>
          <span className="text-brand-border">·</span>
          <span className="text-brand-muted text-xs">
            {new Date(video.publishedAt).getFullYear()}
          </span>
        </div>
      </div>
    </button>
  );
}
