import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const input = z.object({
  userId: z.string().uuid(),
  passengerName: z.string().nullable().optional(),
  routeId: z.string(),
  corridorName: z.string(),
  pickupLabel: z.string(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  dropLabel: z.string(),
  dropLat: z.number(),
  dropLng: z.number(),
});

/**
 * DEMO ONLY — instantly materialise a fully populated live trip for the
 * signed-in passenger: an accepted bot-driven group, this user as a real
 * member, and a pre-seeded group chat. Re-running reuses the same demo group
 * and rewrites its member/chat rows instead of creating duplicates.
 */
export const startDemoTrip = createServerFn({ method: "POST" })
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Bot driver (seeded by provisionDemoAccounts), else any driver profile.
    const { data: botDriver } = await supabaseAdmin
      .from("profiles")
      .select("id, full_name, first_name, plate_number")
      .eq("full_name", "Demo Bot Driver")
      .maybeSingle();
    const driverId = botDriver?.id ?? null;

    // Deterministic: exactly one demo group per user. Find the user's existing
    // demo group first; otherwise create one. Never leaves ambiguous rows.
    const { data: demoBookings } = await supabaseAdmin
      .from("bookings")
      .select("id, group_id")
      .eq("passenger_id", data.userId)
      .not("group_id", "is", null)
      .order("created_at", { ascending: false })
      .limit(20);

    const candidateIds = (demoBookings ?? []).map((b) => b.group_id!) as string[];
    let groupId: string | null = null;
    if (candidateIds.length) {
      const { data: demoGroups } = await supabaseAdmin
        .from("trip_groups")
        .select("id, created_at")
        .in("id", candidateIds)
        .eq("is_demo", true)
        .order("created_at", { ascending: true });
      groupId = demoGroups?.[0]?.id ?? null;
      // Clean up any accidental extra demo groups for this user.
      for (const extra of (demoGroups ?? []).slice(1)) {
        await supabaseAdmin.from("trip_group_messages").delete().eq("group_id", extra.id);
        await supabaseAdmin.from("trip_group_members").delete().eq("group_id", extra.id);
        await supabaseAdmin.from("bookings").update({ group_id: null }).eq("group_id", extra.id);
        await supabaseAdmin.from("trip_groups").delete().eq("id", extra.id);
      }
    }

    const groupPatch = {
      corridor_label: data.routeId,
      pickup_point_label: data.pickupLabel,
      pickup_lat: data.pickupLat,
      pickup_lng: data.pickupLng,
      status: "accepted",
      is_demo: true,
      driver_id: driverId,
      eta_to_pickup: "8 min",
      updated_at: new Date().toISOString(),
    };

    if (groupId) {
      await supabaseAdmin.from("trip_groups").update(groupPatch).eq("id", groupId);
    } else {
      const { data: created, error } = await supabaseAdmin
        .from("trip_groups")
        .insert(groupPatch)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      groupId = created.id;
    }


    // This user's booking on the demo group (reuse the existing one).
    const existingBooking = (myBookings ?? []).find((b) => b.group_id === groupId);
    const bookingPatch = {
      passenger_id: data.userId,
      passenger_name: data.passengerName ?? "You",
      pickup_label: data.pickupLabel,
      pickup_lat: data.pickupLat,
      pickup_lng: data.pickupLng,
      destination_label: data.dropLabel,
      destination_lat: data.dropLat,
      destination_lng: data.dropLng,
      requested_time: new Date().toISOString(),
      status: "grouped",
      group_id: groupId,
      is_bot: false,
      updated_at: new Date().toISOString(),
    };

    let bookingId: string;
    if (existingBooking) {
      bookingId = existingBooking.id;
      await supabaseAdmin.from("bookings").update(bookingPatch).eq("id", bookingId);
    } else {
      const { data: created, error } = await supabaseAdmin
        .from("bookings")
        .insert(bookingPatch)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      bookingId = created.id;
    }

    // Member row for this passenger's drop point (last stop on the run).
    const { data: existingMembers } = await supabaseAdmin
      .from("trip_group_members")
      .select("id, booking_id, drop_order")
      .eq("group_id", groupId);

    const maxOrder = Math.max(0, ...(existingMembers ?? []).map((m) => m.drop_order ?? 0));
    const mine = (existingMembers ?? []).find((m) => m.booking_id === bookingId);
    const memberPatch = {
      group_id: groupId,
      booking_id: bookingId,
      drop_label: data.dropLabel,
      drop_lat: data.dropLat,
      drop_lng: data.dropLng,
      drop_order: mine?.drop_order ?? maxOrder + 1,
    };
    if (mine) {
      await supabaseAdmin.from("trip_group_members").update(memberPatch).eq("id", mine.id);
    } else {
      await supabaseAdmin.from("trip_group_members").insert(memberPatch);
    }

    // Fresh, believable chat thread for this group.
    await supabaseAdmin.from("trip_group_messages").delete().eq("group_id", groupId);

    const { data: bots } = await supabaseAdmin
      .from("profiles")
      .select("id, first_name, full_name")
      .eq("is_bot", true)
      .limit(2);

    const botA = bots?.[0];
    const botB = bots?.[1];
    const driverName = botDriver?.full_name ?? "Your driver";

    const now = Date.now();
    const at = (minutesAgo: number) => new Date(now - minutesAgo * 60000).toISOString();

    await supabaseAdmin.from("trip_group_messages").insert([
      {
        group_id: groupId,
        message: `${driverName} accepted your trip — arriving at ${data.pickupLabel} in about 8 min.`,
        is_system_message: true,
        sender_role: "system",
        created_at: at(6),
      },
      {
        group_id: groupId,
        sender_id: driverId,
        sender_name: driverName,
        sender_role: "driver",
        message: `On my way to ${data.pickupLabel} now — silver van, plate ${botDriver?.plate_number ?? "TGN-031"}.`,
        is_system_message: false,
        created_at: at(5),
      },
      ...(botA
        ? [
            {
              group_id: groupId,
              sender_id: botA.id,
              sender_name: botA.first_name ?? botA.full_name ?? "Rider",
              sender_role: "passenger",
              message: "Got it, I'm already waiting at the corner 👍",
              is_system_message: false,
              created_at: at(3),
            },
          ]
        : []),
      ...(botB
        ? [
            {
              group_id: groupId,
              sender_id: botB.id,
              sender_name: botB.first_name ?? botB.full_name ?? "Rider",
              sender_role: "passenger",
              message: "Confirming my seat — I'll be 2 minutes late, please wait a bit.",
              is_system_message: false,
              created_at: at(1),
            },
          ]
        : []),
    ]);

    // Put the bot driver on the map, coming from North Okkalapa.
    if (driverId) {
      await supabaseAdmin.from("driver_status").upsert(
        {
          driver_id: driverId,
          is_online: true,
          current_lat: 16.9105,
          current_lng: 96.1725,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "driver_id" },
      );
    }

    return { groupId, bookingId };
  });
