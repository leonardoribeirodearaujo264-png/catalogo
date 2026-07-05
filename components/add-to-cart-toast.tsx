"use client";

import { useEffect, useState } from "react";
import { useInterestList } from "@/lib/interest-context";
import { cn } from "@/lib/utils";

export function AddToCartToast() {
  const { notice, isCartOpen } = useInterestList();
  const [visible, setVisible] = useState(false);
  const [shownNoticeId, setShownNoticeId] = useState<number | null>(null);

  if (notice && notice.id !== shownNoticeId) {
    setShownNoticeId(notice.id);
    setVisible(true);
  }

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!notice || isCartOpen) return null;

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
      )}
      aria-live="polite"
    >
      <div className="rounded-full bg-gray-900 px-4 py-2 text-xs font-semibold text-white shadow-lg">
        ✓ {notice.quantity}x adicionado ao carrinho
      </div>
    </div>
  );
}
