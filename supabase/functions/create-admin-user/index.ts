// Supabase Edge Function: create-admin-user
// Deploy with: supabase functions deploy create-admin-user
// This function requires the SUPABASE_SERVICE_ROLE_KEY environment variable

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const authHeader = req.headers.get("Authorization")!;

    // Verify the caller is authenticated and is a super_admin
    const callerClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: callerProfile } = await callerClient.from("profiles").select("role").eq("id", caller.id).single();
    if (callerProfile?.role !== "super_admin") {
      return new Response(JSON.stringify({ error: "Only super admins can create users" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Create the new user with service role
    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { email, password, first_name, last_name, phone, role } = await req.json();

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createError) throw createError;

    // Create profile
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: newUser.user.id,
      first_name,
      last_name,
      email,
      phone: phone || null,
      role: role || "admin",
    });
    if (profileError) throw profileError;

    return new Response(JSON.stringify({ user_id: newUser.user.id }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
