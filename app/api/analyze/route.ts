import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGroq } from "@/lib/groq";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AnalyzeRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let { data: profile } = await supabase
      .from("profiles")
      .select("plan, reviews_used, reviews_limit, pro_expires_at")
      .eq("id", user.id)
      .single();

    if (!profile) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({ id: user.id, email: user.email, plan: "free", reviews_used: 0, reviews_limit: 5 })
        .select()
        .single();
      profile = newProfile;
    }

    // Check if early bird Pro trial has expired
    if (profile?.pro_expires_at && profile.plan === "pro") {
      const expired = new Date(profile.pro_expires_at) < new Date();
      if (expired) {
        await supabase
          .from("profiles")
          .update({ plan: "free", reviews_limit: 5 })
          .eq("id", user.id);
        profile.plan = "free";
        profile.reviews_limit = 5;
      }
    }

    if (profile && profile.reviews_used >= profile.reviews_limit) {
      return NextResponse.json(
        { error: "Monthly review limit reached. Upgrade your plan for more reviews." },
        { status: 429 }
      );
    }

    const body: AnalyzeRequest = await req.json();
    const { type, input, language } = body;

    if (!type || !input) {
      return NextResponse.json({ error: "Missing required fields: type and input" }, { status: 400 });
    }

    if (input.length > 20000) {
      return NextResponse.json({ error: "Input too large. Max 20,000 characters." }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: "AI service not configured." }, { status: 500 });
    }

    if (
      type === "url" &&
      (profile?.plan === "developer" || profile?.plan === "pro") &&
      !process.env.BROWSERLESS_API_KEY
    ) {
      return NextResponse.json({ error: "Full JS rendering not configured." }, { status: 500 });
    }

    const plan = (profile?.plan ?? "free") as "free" | "developer" | "pro";
    console.log(`Analyzing as plan: ${plan}`);

    const result = await analyzeWithGroq({ type, input, language }, plan);

    const { data: saved, error: saveError } = await supabase
      .from("reviews")
      .insert({
        id: result.id,
        user_id: user.id,
        type: result.type,
        input: result.input,
        language: result.language,
        summary: result.summary,
        score: result.score,
        category_scores: result.categoryScores ?? null,
        feedback_items: result.feedbackItems,
        plan_used: plan,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      return NextResponse.json(result);
    }

    await supabase
      .from("profiles")
      .update({ reviews_used: (profile?.reviews_used ?? 0) + 1 })
      .eq("id", user.id);

    return NextResponse.json(saved);
  } catch (error: unknown) {
    console.error("=== ANALYZE ERROR ===", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}