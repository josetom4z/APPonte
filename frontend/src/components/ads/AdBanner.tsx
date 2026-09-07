import React, { useEffect, useState } from 'react';
import { AdvertisementItem, AdPlacement } from '../../types';
import { adsService } from '../../services/ads.service';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AdBannerProps {
  placement: AdPlacement;
  tenantId?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement, tenantId }) => {
  const [ad, setAd] = useState<AdvertisementItem | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const ads = await adsService.serveAds(placement, tenantId, 1);
        if (ads && ads.length > 0) {
          setAd(ads[0]);
        }
      } catch (err) {
        // Silently fail if ad service is unavailable
      }
    };

    fetchAd();
  }, [placement, tenantId]);

  if (!ad) return null;

  const handleClick = () => {
    adsService.trackClick(ad._id);
    window.open(ad.targetUrl, '_blank', 'noopener,noreferrer');
  };

  if (placement === 'SIDEBAR') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm overflow-hidden space-y-3">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3 h-3" />
            Parceiro da Cidade
          </span>
          <span>Patrocinado</span>
        </div>

        {ad.mediaUrl && (
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            className="w-full h-32 object-cover rounded-xl"
          />
        )}

        <div>
          <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{ad.title}</h4>
          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{ad.description}</p>
        </div>

        <button
          onClick={handleClick}
          className="w-full py-2 px-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Conhecer {ad.advertiserName}</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    );
  }

  // Default / Feed / Hero Banner
  return (
    <div
      onClick={handleClick}
      className="cursor-pointer bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-900/80 rounded-2xl border border-emerald-200/50 dark:border-emerald-900/30 p-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {ad.mediaUrl && (
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            className="w-full sm:w-36 h-24 object-cover rounded-xl shrink-0 group-hover:scale-102 transition-transform"
          />
        )}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white tracking-wider">
              Patrocinado
            </span>
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">{ad.advertiserName}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {ad.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
            {ad.description}
          </p>
        </div>
        <div className="shrink-0 flex sm:flex-col items-center justify-center">
          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 group-hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors">
            <span>Visitar</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
