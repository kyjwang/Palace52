export function hasRequiredAppConfig() {
  return Boolean(process.env.DATABASE_URL);
}
