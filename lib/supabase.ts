import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !/^https?:\/\//.test(supabaseUrl)) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL inválida. Abra o arquivo .env.local, cole a URL real do seu projeto Supabase e reinicie o npm run dev."
  );
}

if (!supabaseKey || supabaseKey.includes("COLE_AQUI")) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY inválida. Abra o arquivo .env.local, cole a chave real do Supabase e reinicie o npm run dev."
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);
