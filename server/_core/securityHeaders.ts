export function applySecurityHeaders(setHeader: (name: string, value: string) => void, isProduction: boolean) {
  setHeader("X-Content-Type-Options", "nosniff");
  setHeader("X-Frame-Options", "DENY");
  setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (isProduction) setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
}
