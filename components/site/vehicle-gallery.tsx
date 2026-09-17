"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Vehicle } from "@/types/vehicle";
import { vehicleTitle } from "@/types/vehicle";
import { CarIcon, ChevronLeftIcon, ChevronRightIcon, CloseIcon, ZoomIcon } from "@/components/icons";

export function VehicleGallery({ vehicle }: { vehicle: Vehicle }) {
  const images = vehicle.images?.length
    ? vehicle.images
    : vehicle.coverUrl
      ? [{ id: "cover", url: vehicle.coverUrl, position: 0, isCover: true, storeId: "", vehicleId: "" }]
      : [];

  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const title = vehicleTitle(vehicle);

  const go = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + images.length) % images.length);
    },
    [images.length],
  );

  useEffect(() => {
    if (!fullscreen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setFullscreen(false);
      if (event.key === "ArrowRight") go(1);
      if (event.key === "ArrowLeft") go(-1);
    }
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [fullscreen, go]);

  if (images.length === 0) {
    return (
      <div className="surface flex aspect-16/10 items-center justify-center rounded-2xl text-graphite-600">
        <CarIcon className="h-16 w-16" />
      </div>
    );
  }

  const current = images[index];

  return (
    <div className="flex flex-col gap-3">
      <div className="surface relative aspect-4/3 overflow-hidden rounded-2xl sm:aspect-16/10">
        <Image
          src={current.url}
          alt={`${title} — foto ${index + 1} de ${images.length}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />

        <button
          type="button"
          onClick={() => setFullscreen(true)}
          aria-label="Ver em tela cheia"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
        >
          <ZoomIcon className="h-4 w-4" />
        </button>

        {images.length > 1 && (
          <>
            <GalleryArrow side="left" onClick={() => go(-1)} />
            <GalleryArrow side="right" onClick={() => go(1)} />
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
          {images.map((image, position) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Ver foto ${position + 1}`}
              aria-current={position === index}
              className={cn(
                "relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:h-20 sm:w-28",
                position === index ? "accent-border" : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <Image src={image.url} alt="" fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {fullscreen && (
        <div className="fixed inset-0 z-200 flex flex-col bg-black/97">
          <div className="flex items-center justify-between px-5 py-4">
            <span className="text-sm text-mute">
              {index + 1} / {images.length}
            </span>
            <button
              onClick={() => setFullscreen(false)}
              aria-label="Fechar"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10"
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="relative flex-1">
            <Image
              src={current.url}
              alt={`${title} — foto ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
            {images.length > 1 && (
              <>
                <GalleryArrow side="left" onClick={() => go(-1)} />
                <GalleryArrow side="right" onClick={() => go(1)} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryArrow({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  const Icon = side === "left" ? ChevronLeftIcon : ChevronRightIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Foto anterior" : "Próxima foto"}
      className={cn(
        "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
