"use client";

import dynamic from "next/dynamic";

// Mux player is a Web Component — load client-side only
const MuxPlayerReact = dynamic(() => import("@mux/mux-player-react"), { ssr: false });

interface MuxPlayerProps {
  playbackId: string;
  title?: string;
  thumbnail?: string;
  className?: string;
}

export function MuxPlayer({ playbackId, title, thumbnail, className }: MuxPlayerProps) {
  return (
    <MuxPlayerReact
      playbackId={playbackId}
      metadata={{ video_title: title }}
      poster={thumbnail}
      className={className}
      style={{ width: "100%", borderRadius: 22, background: "#191919" }}
      streamType="on-demand"
    />
  );
}
