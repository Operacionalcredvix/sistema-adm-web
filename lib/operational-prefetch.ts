import { supabase } from "@/lib/supabase";
import { buildClientCacheKey, setCachedValue } from "@/lib/client-cache";
import { getCurrentUserProfile } from "@/lib/user-profile";

let prewarmInFlight: Promise<void> | null = null;

async function prewarmUserProfile(authUserId: string, email: string) {
  try {
    await getCurrentUserProfile(authUserId, email);
  } catch {
    // Prefetch é melhoria de UX. Falha silenciosa não deve bloquear navegação.
  }
}

async function prewarmUnidades(authUserId: string) {
  try {
    const { data } = await supabase
      .from("vw_unidades_lista")
      .select(
        "unidade_id, nome_fantasia, razao_social, cnpj, qtd_vencidos, qtd_vence_em_7_dias, qtd_cadastro_incompleto, qtd_sem_anexo, prioridade_lista, proximo_prazo_relevante"
      )
      .order("prioridade_lista", { ascending: true })
      .order("nome_fantasia", { ascending: true });

    setCachedValue(buildClientCacheKey("unidades-lista", authUserId), {
      unidades: data ?? [],
    });
  } catch {
    // Cache não é requisito funcional.
  }
}

async function prewarmAlertas(authUserId: string) {
  try {
    const { data } = await supabase
      .from("vw_alertas_unidade_tela")
      .select(
        "unidade_id, nome_fantasia, tipo_nome, alerta_codigo, alerta_titulo, alerta_descricao, severidade_visual, prioridade_alerta, data_referencia_alerta"
      )
      .order("prioridade_alerta", { ascending: true })
      .order("nome_fantasia", { ascending: true });

    setCachedValue(buildClientCacheKey("alertas", authUserId), {
      alerts: data ?? [],
    });
  } catch {
    // Cache não é requisito funcional.
  }
}

export function prewarmOperationalCache(authUserId: string, email = "") {
  if (!authUserId) return Promise.resolve();

  if (prewarmInFlight) {
    return prewarmInFlight;
  }

  prewarmInFlight = (async () => {
    await Promise.allSettled([
      prewarmUserProfile(authUserId, email),
      prewarmUnidades(authUserId),
      prewarmAlertas(authUserId),
    ]);
  })().finally(() => {
    prewarmInFlight = null;
  });

  return prewarmInFlight;
}

export async function prewarmOperationalCacheWithTimeout(
  authUserId: string,
  email = "",
  timeoutMs = 900
) {
  if (!authUserId) return;

  await Promise.race([
    prewarmOperationalCache(authUserId, email),
    new Promise((resolve) => window.setTimeout(resolve, timeoutMs)),
  ]);
}
