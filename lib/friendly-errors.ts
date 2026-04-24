export function getFriendlyErrorMessage(error: unknown, fallback: string) {
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "";

  const message = rawMessage.toLowerCase();

  if (
    message.includes("invalid login credentials") ||
    message.includes("invalid credentials")
  ) {
    return "E-mail ou senha inválidos. Confira os dados e tente novamente.";
  }

  if (
    message.includes("invalid refresh token") ||
    message.includes("refresh token not found") ||
    message.includes("jwt expired") ||
    message.includes("session")
  ) {
    return "Sua sessão expirou. Faça login novamente.";
  }

  if (
    message.includes("failed to fetch") ||
    message.includes("network") ||
    message.includes("fetch")
  ) {
    return "Não foi possível conectar ao sistema. Verifique a internet e tente novamente.";
  }

  if (
    message.includes("permission denied") ||
    message.includes("not authorized") ||
    message.includes("unauthorized") ||
    message.includes("row-level security") ||
    message.includes("rls")
  ) {
    return "Você não tem permissão para realizar esta ação.";
  }

  if (
    message.includes("mime type") ||
    message.includes("not supported") ||
    message.includes("unsupported")
  ) {
    return "Arquivo não permitido. Envie apenas PDF, PNG, JPG ou JPEG.";
  }

  if (
    message.includes("too large") ||
    message.includes("file size") ||
    message.includes("exceeded")
  ) {
    return "Arquivo muito grande. O limite permitido é 10 MB.";
  }

  return fallback;
}
