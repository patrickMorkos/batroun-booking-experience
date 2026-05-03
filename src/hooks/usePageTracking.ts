import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

function getSessionId(): string {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

export function usePageTracking() {
  const { pathname } = useLocation();
  const lastTracked = useRef("");

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (pathname === lastTracked.current) return;
    lastTracked.current = pathname;

    const chaletMatch = pathname.match(/^\/chalets\/(.+)$/);
    const chaletSlug = chaletMatch ? chaletMatch[1] : null;

    supabase.from("page_views").insert({
      page_path: pathname,
      chalet_slug: chaletSlug,
      session_id: getSessionId(),
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
    }).then(({ error }) => {
      if (error) console.error("[PageTracking] insert failed:", error.message);
    });
  }, [pathname]);
}
