import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGroq } from "@/lib/groq";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AnalyzeRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check usage limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, reviews_used, reviews_limit")
      .eq("id", user.id)
      .single();

    if (profile && profile.reviews_used >= profile.reviews_limit) {
      return NextResponse.json(
        { error: "Monthly review limit reached. Upgrade to Pro for more reviews." },
        { status: 429 }
      );
    }

    const body: AnalyzeRequest = await req.json();
    const { type, input, language } = body;

    if (!type || !input) {
      return NextResponse.json(
        { error: "Missing required fields: type and input" },
        { status: 400 }
      );
    }

    // Run analysis
    const result = await analyzeWithGroq({ type, input, language });

    // Save to Supabase
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
        feedback_items: result.feedbackItems,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
      // Return result even if save fails
      return NextResponse.json(result);
    }

    // Increment usage counter
    await supabase
      .from("profiles")
      .update({ reviews_used: (profile?.reviews_used ?? 0) + 1 })
      .eq("id", user.id);

    return NextResponse.json(saved);
  } catch (error) {
    console.error("Analyze error:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
