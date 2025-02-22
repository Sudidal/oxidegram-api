declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      PORT: string;
      DATABASE_URL: string;
      JWT_SECRET: string;
      SUPABASE_URL: string;
      SUPABASE_KEY: string;
      ALLOWED_ORIGIN: string;
      WS_ALLOWED_ORIGIN: string;
      WS_ADMIN_USERNAME: string;
      WS_ADMIN_PASSWORD: string;
    }
  }
}

export {};
