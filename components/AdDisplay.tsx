'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { trpc } from '@/app/providers';

export function AdDisplay({ position }: { position: string }) {
  const { data: ads } = trpc.ads.getByPosition.useQuery({ position });
  const trackImpression = trpc.ads.trackImpression.useMutation();
  const trackClick = trpc.ads.trackClick.useMutation();
  const trackedImpressions = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (ads && ads.length > 0) {
      ads.forEach((ad) => {
        if (!trackedImpressions.current.has(ad.id)) {
          trackImpression.mutate({ id: ad.id });
          trackedImpressions.current.add(ad.id);
        }
      });
    }
  }, [ads, trackImpression]);

  if (!ads || ads.length === 0) {
    return null;
  }

  const ad = ads[0]; // Display first active ad

  const handleClick = () => {
    trackClick.mutate({ id: ad.id });
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (ad.type === 'ADSENSE' || ad.type === 'FACEBOOK') {
    // Render script-based ads
    return (
      <div
        className="ad-container"
        dangerouslySetInnerHTML={{ __html: ad.script || '' }}
        onClick={handleClick}
      />
    );
  }

  if (ad.type === 'CUSTOM') {
    // Render custom ad
    return (
      <div className="ad-container border rounded-lg p-4 bg-muted/50">
        {ad.imageUrl && (
          <div className="relative w-full h-48 mb-2 rounded overflow-hidden">
            <Image
              src={ad.imageUrl}
              alt={ad.title || 'Advertisement'}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          </div>
        )}
        {ad.title && <h3 className="font-semibold mb-1">{ad.title}</h3>}
        {ad.content && <p className="text-sm text-muted-foreground mb-2">{ad.content}</p>}
        {ad.linkUrl && (
          <a
            href={ad.linkUrl}
            onClick={handleClick}
            className="text-sm text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn more →
          </a>
        )}
      </div>
    );
  }

  return null;
}
