import { cn } from "@/lib/utils";

export function ItemImage({
  src,
  icon,
  alt,
  className,
  watermark,
}: {
  src?: string;
  icon: string;
  alt: string;
  className?: string;
  /** Texto de marca exibido como marca d'água discreta quando não há foto. */
  watermark?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} loading="lazy" />;
  }

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 text-5xl",
        className,
      )}
      role="img"
      aria-label={alt}
    >
      {watermark && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-3xl font-extrabold uppercase tracking-widest text-gray-400/40 select-none">
          {watermark}
        </span>
      )}
      <span className="relative drop-shadow-sm">{icon}</span>
    </div>
  );
}
