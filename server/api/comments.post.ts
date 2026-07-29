import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "~/types/database.types";

const schema = z.object({
  tripId: z.string().uuid(),
  authorName: z.string().trim().min(1).max(60),
  body: z.string().trim().min(1).max(2000),
  token: z.string().min(1),
});

// Rate-limit léger en mémoire (couche secondaire — peu fiable en serverless,
// Turnstile reste la vraie barrière anti-spam).
const RATE_LIMIT = 5;
const WINDOW_MS = 10 * 60 * 1000;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

export default defineEventHandler(async (event) => {
  const parsed = schema.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400, message: "Données invalides" });
  }
  const { tripId, authorName, body, token } = parsed.data;

  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";
  if (isRateLimited(ip)) {
    throw createError({ statusCode: 429, message: "Trop de commentaires, réessaie plus tard." });
  }

  const captcha = await verifyTurnstileToken(token);
  if (!captcha.success) {
    throw createError({ statusCode: 401, message: "Vérification anti-spam échouée" });
  }

  const serviceKey = useRuntimeConfig().supabaseServiceKey;
  if (!serviceKey) {
    throw createError({
      statusCode: 500,
      message: "SUPABASE_SERVICE_KEY manquante côté serveur",
    });
  }

  const supabase = createClient<Database>(process.env.SUPABASE_URL!, serviceKey);

  const { data, error } = await supabase
    .from("comments")
    .insert({ trip_id: tripId, author_name: authorName, body })
    .select()
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: "Impossible d'enregistrer le commentaire" });
  }

  return data;
});
