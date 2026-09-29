import { createClient } from "@supabase/supabase-js";
import * as path from "path";
import * as fs from "fs";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      process.env[key] = val;
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

async function main() {
  console.log("Checking Supabase homepage_sections table...");

  const { data: existing, error: checkError } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("section_key", "crafting_moments")
    .maybeSingle();

  if (checkError) {
    console.error("Error querying homepage_sections:", checkError);
    process.exit(1);
  }

  if (existing) {
    console.log("crafting_moments section already exists with ID:", existing.id);
    console.log("Current config:", existing.config);
  } else {
    console.log("Inserting crafting_moments into homepage_sections...");
    const { data: inserted, error: insertError } = await supabase
      .from("homepage_sections")
      .insert({
        section_key: "crafting_moments",
        is_enabled: true,
        sort_order: 2,
        is_featured: false,
        config: {
          eyebrow: "Since 1989",
          title: "Decorating celebrations,",
          title_highlight: "Creating memories.",
        },
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Error inserting section:", insertError);
      process.exit(1);
    }

    console.log("Successfully inserted crafting_moments section:", inserted);
  }

  // Also check hero section to see if it exists
  const { data: heroSection, error: heroError } = await supabase
    .from("homepage_sections")
    .select("*")
    .eq("section_key", "hero")
    .maybeSingle();

  if (heroError) {
    console.error("Error querying hero section:", heroError);
  } else if (heroSection) {
    console.log("Hero section found:", heroSection.id);
  }

  const { data: allSections } = await supabase
    .from("homepage_sections")
    .select("section_key, is_enabled, sort_order")
    .order("sort_order", { ascending: true });

  console.log("All current homepage sections in Supabase:", allSections);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
