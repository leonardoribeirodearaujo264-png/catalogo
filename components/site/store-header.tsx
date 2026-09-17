"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStoreView } from "@/lib/store-view-context";
import { cn, formatPhone } from "@/lib/utils";
import { buildStoreMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { lockBodyScroll } from "@/lib/scroll-lock";
import {
  CarIcon,
  ChatIcon,
  CloseIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  WhatsAppIcon,
} from "@/components/icons";

export function StoreHeader() {
  const { store } = useStoreView();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const root = `/loja/${store.slug}`;
  const links = [
    { href: root, label: "Início", exact: true },
    { href: `${root}/veiculos`, label: "Veículos" },
    { href: `${root}/sobre`, label: "Sobre nós" },
    { href: `${root}/contato`, label: "Contato" },
  ];

  // Sobre o banner o header é transparente; ao rolar, vira vidro fosco.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    const frame = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => lockBodyScroll(open), [open]);

  const whatsappHref = store.whatsappNumber
    ? buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))
    : `${root}/contato`;

  const address = store.address;
  const addressLine = [address.street && `${address.street}${address.number ? `, ${address.number}` : ""}`, address.city]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "surface-glass shadow-lg" : "border-b border-transparent bg-linear-to-b from-black/70 to-transparent",
        )}
      >
        <div
          className={cn(
            "container-app flex items-center justify-between gap-4 transition-all duration-300",
            scrolled ? "h-[64px] md:h-[72px]" : "h-[72px] md:h-[88px]",
          )}
        >
          <Link href={root} className="flex min-w-0 items-center gap-3" aria-label={`${store.name} — início`}>
            {store.logoUrl ? (
              <Image
                src={store.logoUrl}
                alt={store.name}
                width={200}
                height={56}
                priority
                className={cn(
                  "w-auto max-w-[150px] object-contain transition-all duration-300 sm:max-w-[200px]",
                  scrolled ? "h-9 md:h-10" : "h-10 md:h-12",
                )}
              />
            ) : (
              <span className="flex min-w-0 items-center gap-2.5">
                <CarIcon className="h-6 w-6 shrink-0 accent-text md:h-7 md:w-7" />
                <span className="brand-wordmark truncate text-[15px] uppercase text-cream md:text-[19px]">
                  {store.name}
                </span>
              </span>
            )}
          </Link>

          <nav aria-label="Navegação principal" className="hidden items-center gap-9 lg:flex">
            {links.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative py-1.5 text-[15px] transition-colors",
                    active ? "text-cream" : "text-mute hover:text-cream",
                  )}
                >
                  {link.label}
                  {active && <span className="accent-bg absolute -bottom-0.5 left-0 h-0.5 w-full rounded-full" />}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={whatsappHref}
              target={store.whatsappNumber ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="accent-bg press hidden h-11 items-center gap-2 rounded-full px-6 text-[14px] font-semibold text-ink transition-all hover:brightness-110 lg:inline-flex"
            >
              <ChatIcon className="h-4 w-4" />
              Fale conosco
            </a>

            {store.whatsappNumber && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Falar no WhatsApp"
                className="press flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[#3ddc84] backdrop-blur lg:hidden"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            )}

            <button
              type="button"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              aria-expanded={open}
              aria-controls="menu-loja"
              onClick={() => setOpen(true)}
              className="press flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-cream backdrop-blur lg:hidden"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Menu lateral do celular */}
      <div
        id="menu-loja"
        className={cn("fixed inset-0 z-60 lg:hidden", open ? "pointer-events-auto" : "pointer-events-none")}
        aria-hidden={!open}
      >
        <button
          tabIndex={open ? 0 : -1}
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
          className={cn(
            "absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300",
            open ? "opacity-100" : "opacity-0",
          )}
        />

        <nav
          aria-label="Navegação"
          className={cn(
            "absolute inset-y-0 right-0 flex w-[86%] max-w-[360px] flex-col bg-graphite-950 shadow-2xl transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-4">
            <span className="brand-wordmark truncate text-[13px] uppercase text-mute">{store.name}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              tabIndex={open ? 0 : -1}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/12 text-cream"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-3">
            {links.map((link) => {
              const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  tabIndex={open ? 0 : -1}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-[56px] items-center justify-between border-b border-white/6 text-[17px] transition-colors",
                    active ? "accent-text font-semibold" : "text-cream",
                  )}
                >
                  {link.label}
                  {active && <span className="accent-bg h-1.5 w-1.5 rounded-full" />}
                </Link>
              );
            })}

            <div className="mt-6 flex flex-col gap-2.5 text-[14px] text-mute">
              {store.whatsappNumber && (
                <p className="flex items-center gap-2.5">
                  <WhatsAppIcon className="h-4 w-4 shrink-0 accent-text" />
                  {formatPhone(store.whatsappNumber)}
                </p>
              )}
              {store.email && (
                <p className="flex items-center gap-2.5 break-all">
                  <MailIcon className="h-4 w-4 shrink-0 accent-text" />
                  {store.email}
                </p>
              )}
              {addressLine && (
                <p className="flex items-start gap-2.5">
                  <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 accent-text" />
                  {addressLine}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-white/8 p-5">
            <a
              href={whatsappHref}
              target={store.whatsappNumber ? "_blank" : undefined}
              rel="noopener noreferrer"
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="accent-bg press flex h-13 min-h-[52px] items-center justify-center gap-2.5 rounded-full text-[15px] font-semibold text-ink"
            >
              <ChatIcon className="h-5 w-5" />
              Fale conosco
            </a>
          </div>
        </nav>
      </div>
    </>
  );
}
