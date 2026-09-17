"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Imagem da vitrine com três estados: carregando (skeleton), carregada e
 * ausente/quebrada (fallback automotivo).
 *
 * O fallback existe para o caso legítimo — loja que ainda não enviou foto —
 * e também para quando a URL existe mas falha (arquivo removido do bucket,
 * rede caindo). Em nenhum dos dois o visitante vê ícone de imagem quebrada,
 * e o espaço reservado continua o mesmo, então o layout não pula.
 */
export function StoreImage({
  src,
  alt,
  fill = true,
  width,
  height,
  sizes,
  priority,
  className,
  imageClassName,
  rounded,
}: {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showFallback = !src || failed;

  return (
    <div className={cn("relative overflow-hidden bg-graphite-900", rounded, className)}>
      {showFallback ? (
        <VehiclePlaceholder />
      ) : (
        <>
          {!loaded && <div aria-hidden className="absolute inset-0 skeleton" />}
          <Image
            src={src}
            alt={alt}
            fill={fill}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            sizes={sizes}
            priority={priority}
            onLoad={() => setLoaded(true)}
            onError={() => {
              if (process.env.NODE_ENV === "development") {
                console.warn(`[car-select] imagem não carregou: ${src}`);
              }
              setFailed(true);
            }}
            className={cn(
              "object-cover transition-opacity duration-500",
              loaded ? "opacity-100" : "opacity-0",
              imageClassName,
            )}
          />
        </>
      )}
    </div>
  );
}

/**
 * Placeholder desenhado, não um ícone genérico: silhueta de carro em traço
 * fino sobre o grafite da marca. Fica coerente com o resto da página mesmo
 * ocupando um card inteiro.
 */
export function VehiclePlaceholder({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "absolute inset-0 flex items-center justify-center bg-linear-to-br from-graphite-850 via-graphite-900 to-ink",
        className,
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0 22px, rgba(255,255,255,0.5) 22px 23px)",
        }}
      />
      <svg
        viewBox="0 0 160 70"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="relative w-[46%] max-w-[190px] text-graphite-600"
      >
        <path d="M8 46h6a10 10 0 0 1 20 0h92a10 10 0 0 1 20 0h6" />
        <path d="M14 46 18 27a9 9 0 0 1 8.6-6.4h60.8a9 9 0 0 1 6.9 3.2L106 39" />
        <path d="M18 39h88" />
        <circle cx="24" cy="46" r="10" />
        <circle cx="136" cy="46" r="10" />
        <path d="M106 39h34a12 12 0 0 1 12 12" />
        <path d="M60 21v18" />
      </svg>
    </div>
  );
}
