import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";

export function QuickAction({
  href,
  icon,
  label,
  external,
}: {
  href: string;
  icon: string;
  label: string;
  external?: boolean;
}) {
  const content = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-base transition-colors group-hover:bg-gray-900 group-hover:text-white">
        {icon}
      </span>
      <span className="flex-1 text-sm font-bold text-gray-800">{label}</span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500" />
    </>
  );

  const className =
    "group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3.5 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md active:translate-y-0";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
