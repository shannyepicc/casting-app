import { createClient } from "@/lib/supabase/server";
import { mux } from "@/lib/mux";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only actors can upload video content
  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (!profile || profile.account_type !== "actor") {
    return NextResponse.json({ error: "Only actors can upload video content" }, { status: 403 });
  }

  const { title } = await request.json();

  // Create Mux direct upload
  const upload = await mux.video.uploads.create({
    new_asset_settings: {
      playback_policy: ["public"],
      video_quality: "basic"
    },
    cors_origin: process.env.NEXT_PUBLIC_APP_URL!
  });

  // Store media metadata in DB
  const { data: media, error } = await supabase
    .from("media")
    .insert({
      owner_id: user.id,
      media_type: "video",
      title: title ?? null,
      mux_upload_id: upload.id,
      status: "pending"
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ uploadUrl: upload.url, mediaId: media.id, uploadId: upload.id });
}
