"use client";

import { useEffect, useRef } from "react";
import { useStoreView } from "@/lib/store-view-context";
import { getBrowserClient } from "@/lib/supabase/browser-client";
import { trackStoreEvent } from "@/lib/supabase/queries";

/**
 * Contabiliza uma visita ao catálogo por sessão do navegador. Não grava
 * nada sobre o visitante — só um evento anônimo ligado à loja, que é o que
 * alimenta "visualizações do catálogo" no painel.
 */
export function StoreViewTracker() {
  const { store } = useStoreView();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const key = `carselect:viewed:${store.id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // sessionStorage indisponível: conta a visita mesmo assim
    }

    const client = getBrowserClient();
    if (client) trackStoreEvent(client, store.id, "view_store");
  }, [store.id]);

  return null;
}

export function VehicleViewTracker({ vehicleId }: { vehicleId: string }) {
  const { store } = useStoreView();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;

    const key = `carselect:viewed-vehicle:${vehicleId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // segue sem deduplicar
    }

    const client = getBrowserClient();
    if (client) trackStoreEvent(client, store.id, "view_vehicle", vehicleId);
  }, [store.id, vehicleId]);

  return null;
}
