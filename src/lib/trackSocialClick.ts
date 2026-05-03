import { supabase } from "@/lib/supabase";

function getSessionId(): string {
  let id = sessionStorage.getItem("session_id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("session_id", id);
  }
  return id;
}

export function trackSocialClick(platform: "instagram" | "tiktok" | "facebook") {
  supabase.from("social_clicks").insert({
    platform,
    session_id: getSessionId(),
  }).then(({ error }) => {
    if (error) console.error("[SocialClick] insert failed:", error.message);
  });
}
