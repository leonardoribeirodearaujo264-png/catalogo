"use client";

import { useStoreView } from "@/lib/store-view-context";
import { formatPhone } from "@/lib/utils";
import { buildStoreMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { LeadForm } from "./vehicle-actions";
import { StoreContactLines } from "./store-sections";
import { ClockIcon, MailIcon, MapPinIcon, PhoneIcon, WhatsAppIcon } from "@/components/icons";

export function ContactSection() {
  const { store } = useStoreView();
  const address = store.address;

  const mapQuery = [address.street, address.number, address.neighborhood, address.city, address.state, address.zip]
    .filter(Boolean)
    .join(", ");

  const mapSrc =
    address.mapUrl ||
    (mapQuery ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed` : null);
  const mapLink = mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}` : null;

  const whatsappHref = store.whatsappNumber
    ? buildWhatsAppUrl(store.whatsappNumber, buildStoreMessage(store))
    : null;

  return (
    <section className="container-app section-y">
      <div className="mb-8 max-w-2xl md:mb-12">
        <p className="eyebrow mb-3">Fale com a gente</p>
        <h2 className="font-display text-h2 text-cream">Vamos encontrar seu próximo carro</h2>
        <p className="mt-4 text-[15.5px] leading-relaxed text-mute md:text-[17px]">
          Um consultor da {store.name} responde em horário comercial. Se preferir resposta na hora, chame direto
          no WhatsApp.
        </p>
      </div>

      {/* No celular o WhatsApp vem antes de tudo: é o caminho mais curto. */}
      {whatsappHref && (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="press mb-6 flex min-h-[60px] w-full items-center justify-center gap-3 rounded-2xl bg-[#25D366] text-[16px] font-semibold text-white shadow-lg lg:hidden"
        >
          <WhatsAppIcon className="h-6 w-6" />
          Chamar no WhatsApp
        </a>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-4">
          {whatsappHref && (
            <ContactRow
              href={whatsappHref}
              external
              icon={<WhatsAppIcon className="h-5 w-5 text-[#3ddc84]" />}
              label="WhatsApp"
              value={formatPhone(store.whatsappNumber)}
            />
          )}
          {store.phone && (
            <ContactRow
              href={`tel:${store.phone}`}
              icon={<PhoneIcon className="h-5 w-5 accent-text" />}
              label="Telefone"
              value={formatPhone(store.phone)}
            />
          )}
          {store.email && (
            <ContactRow
              href={`mailto:${store.email}`}
              icon={<MailIcon className="h-5 w-5 accent-text" />}
              label="E-mail"
              value={store.email}
            />
          )}

          {(mapQuery || store.businessHours.length > 0) && (
            <div className="surface rounded-2xl p-5">
              <div className="mb-3 flex items-center gap-2.5">
                {store.businessHours.length > 0 ? (
                  <ClockIcon className="h-5 w-5 accent-text" />
                ) : (
                  <MapPinIcon className="h-5 w-5 accent-text" />
                )}
                <span className="eyebrow-mute">Onde e quando</span>
              </div>
              <StoreContactLines />
              {mapLink && (
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="accent-text mt-4 inline-flex items-center gap-2 text-[14px] font-medium hover:underline"
                >
                  Ver rota no Google Maps
                </a>
              )}
            </div>
          )}

          {mapSrc && (
            <div className="surface overflow-hidden rounded-2xl">
              <iframe
                src={mapSrc}
                title={`Mapa da ${store.name}`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-[260px] w-full border-0 grayscale-[0.35] contrast-[1.1] md:h-[320px]"
              />
            </div>
          )}
        </div>

        <div className="surface rounded-3xl p-6 lg:sticky lg:top-28 lg:self-start lg:p-8">
          <h3 className="font-display text-h3 text-cream">Enviar mensagem</h3>
          <p className="mb-6 mt-1.5 text-[14px] text-mute">
            Preencha e a equipe entra em contato pelo telefone informado.
          </p>
          <LeadForm origin="contato" />
        </div>
      </div>
    </section>
  );
}

function ContactRow({
  href,
  external,
  icon,
  label,
  value,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="surface press flex min-h-[72px] items-center gap-4 rounded-2xl px-5 py-4 transition-colors hover:accent-border"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/5">{icon}</span>
      <span className="min-w-0">
        <span className="block text-[12.5px] text-mute">{label}</span>
        <span className="block break-all text-[15.5px] text-cream">{value}</span>
      </span>
    </a>
  );
}
