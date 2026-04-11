import { mux } from "@/lib/mux";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("mux-signature") ?? "";

  // Verify webhook signature (requires MUX_WEBHOOK_SECRET in env for production)
  // For MVP we verify if secret is configured, otherwise pass through
  if (process.env.MUX_WEBHOOK_SECRET) {
    try {
      mux.webhooks.verifySignature(body, request.headers, process.env.MUX_WEBHOOK_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  const event = JSON.parse(body);
  const supabase = await createClient();

  switch (event.type) {
    // Upload created an asset — link them
    case "video.upload.asset_created": {
      const uploadId = event.data.id as string;
      const assetId = event.data.asset_id as string;

      await supabase
        .from("media")
        .update({ mux_asset_id: assetId, status: "processing" })
        .eq("mux_upload_id", uploadId);
      break;
    }

    // Asset finished processing — playback ready
    case "video.asset.ready": {
      const assetId = event.data.id as string;
      const playbackId = (event.data.playback_ids as { id: string; policy: string }[])?.[0]?.id;
      const duration = event.data.duration as number | undefined;

      await supabase
        .from("media")
        .update({
          mux_playback_id: playbackId,
          status: "ready",
          duration: duration ?? null,
          thumbnail_url: playbackId ? `https://image.mux.com/${playbackId}/thumbnail.png` : null
        })
        .eq("mux_asset_id", assetId);
      break;
    }

    // Asset errored
    case "video.asset.errored": {
      const assetId = event.data.id as string;
      await supabase.from("media").update({ status: "failed" }).eq("mux_asset_id", assetId);
      break;
    }

    // Upload cancelled / errored
    case "video.upload.cancelled":
    case "video.upload.errored": {
      const uploadId = event.data.id as string;
      await supabase.from("media").update({ status: "failed" }).eq("mux_upload_id", uploadId);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
