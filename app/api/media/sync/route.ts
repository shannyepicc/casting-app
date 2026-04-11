import { createClient } from "@/lib/supabase/server";
import { mux } from "@/lib/mux";
import { NextResponse } from "next/server";

// Directly queries Mux for current status of pending/processing videos.
// Called by the media page when webhooks aren't reachable (e.g. localhost).
export async function POST() {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all pending/processing videos for this user
  const { data: pending } = await supabase
    .from("media")
    .select("id, mux_upload_id, mux_asset_id, status")
    .eq("owner_id", user.id)
    .in("status", ["pending", "processing"]);

  if (!pending?.length) {
    return NextResponse.json({ synced: 0 });
  }

  let synced = 0;

  for (const record of pending) {
    try {
      let assetId = record.mux_asset_id;

      // If we only have an upload_id, try to resolve the asset_id from the upload
      if (!assetId && record.mux_upload_id) {
        const upload = await mux.video.uploads.retrieve(record.mux_upload_id);
        if (upload.asset_id) {
          assetId = upload.asset_id;
          await supabase
            .from("media")
            .update({ mux_asset_id: assetId, status: "processing" })
            .eq("id", record.id);
        } else {
          // Upload not yet linked to an asset — still truly pending
          continue;
        }
      }

      if (!assetId) continue;

      // Fetch asset details from Mux
      const asset = await mux.video.assets.retrieve(assetId);

      if (asset.status === "ready") {
        const playbackId = asset.playback_ids?.[0]?.id ?? null;
        await supabase
          .from("media")
          .update({
            mux_asset_id: assetId,
            mux_playback_id: playbackId,
            status: "ready",
            duration: asset.duration ?? null,
            thumbnail_url: playbackId
              ? `https://image.mux.com/${playbackId}/thumbnail.png`
              : null
          })
          .eq("id", record.id);
        synced++;
      } else if (asset.status === "errored") {
        await supabase.from("media").update({ status: "failed" }).eq("id", record.id);
        synced++;
      } else {
        // Still processing — update status in case it moved from pending
        await supabase.from("media").update({ status: "processing" }).eq("id", record.id);
      }
    } catch {
      // Skip records that error — don't fail the whole sync
    }
  }

  return NextResponse.json({ synced });
}
