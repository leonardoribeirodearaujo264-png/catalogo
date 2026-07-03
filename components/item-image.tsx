import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-slate-700 to-slate-900",
  "from-emerald-600 to-emerald-900",
  "from-rose-500 to-rose-800",
  "from-amber-500 to-amber-800",
  "from-sky-600 to-sky-900",
  "from-fuchsia-600 to-fuchsia-900",
];

function gradientFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}

export function ItemImage({
  src,
  icon,
  seed,
  alt,
  className,
}: {
  src?: string;
  icon: string;
  seed: string;
  alt: string;
  className?: string;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={cn("h-full w-full object-cover", className)} loading="lazy" />;
  }

  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-gradient-to-br text-5xl",
        gradientFor(seed),
        className,
      )}
      role="img"
      aria-label={alt}
    >
      <span className="drop-shadow-sm">{icon}</span>
    </div>
  );
}
