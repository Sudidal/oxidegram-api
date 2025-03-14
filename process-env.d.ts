declare global {
  namespace NodeJS {
    class ProcessEnv {
      [key: string]: string | undefined;
      readonly PORT: string;
      readonly HOSTNAME: string;
      readonly DATABASE_URL: string;
      readonly JWT_SECRET: string;
      readonly SUPABASE_URL: string;
      readonly SUPABASE_KEY: string;
      readonly ALLOWED_ORIGIN: string;
      readonly WS_ALLOWED_ORIGIN: string;
      readonly WS_ADMIN_USERNAME: string;
      readonly WS_ADMIN_PASSWORD: string;
    }
  }
}

export {};
