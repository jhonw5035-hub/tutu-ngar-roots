import { createServerFn } from "@tanstack/react-start";

/**
 * One-shot demo provisioning: the fixed admin account plus two drivers
 * (one teammate-controlled, one "bot"). Idempotent — existing accounts are
 * left untouched, so it is safe to call more than once.
 */
export const provisionDemoAccounts = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const accounts = [
    {
      email: "admin@gmail.com",
      password: "admin@123",
      role: "admin",
      full_name: "Tu Tu Ngar Ops",
      first_name: "Ops",
      phone: "09000000000",
    },
    {
      email: "driver1@ttn.demo",
      password: "driver@123",
      role: "driver",
      full_name: "Ko Aung (teammate)",
      first_name: "Aung",
      phone: "09111111111",
      plate_number: "TGN-024",
      seat_capacity: 4,
      gender: "male",
    },
    {
      email: "bot.driver@ttn.demo",
      password: "driver@123",
      role: "driver",
      full_name: "Demo Bot Driver",
      first_name: "Bot",
      phone: "09222222222",
      plate_number: "TGN-031",
      seat_capacity: 7,
      gender: "other",
    },
  ];

  const created: string[] = [];
  const skipped: string[] = [];

  for (const account of accounts) {
    const { email, password, ...meta } = account;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: meta,
    });
    if (error) {
      skipped.push(email);
      continue;
    }
    created.push(email);

    // The signup trigger seeds profiles + roles; ensure the bot driver is
    // online so grouping always finds a driver in the demo.
    if (email === "bot.driver@ttn.demo" && data.user) {
      await supabaseAdmin.from("driver_status").upsert(
        {
          driver_id: data.user.id,
          is_online: true,
          current_lat: 16.8261,
          current_lng: 96.1315,
        },
        { onConflict: "driver_id" },
      );
    }
  }

  return { created, skipped };
});
