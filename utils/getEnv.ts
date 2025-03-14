import process from "node:process";
import { config } from "dotenv";

config();

class RequiredEnvs implements NodeJS.ProcessEnv {
  [index: string]: string | undefined;
  PORT: string = process.env.PORT;
  HOSTNAME: string = process.env.HOSTNAME;
  DATABASE_URL: string = process.env.DATABASE_URL;
  JWT_SECRET: string = process.env.JWT_SECRET;
  SUPABASE_URL: string = process.env.SUPABASE_URL;
  SUPABASE_KEY: string = process.env.SUPABASE_KEY;
  ALLOWED_ORIGIN: string = process.env.ALLOWED_ORIGIN;
  WS_ALLOWED_ORIGIN: string = process.env.WS_ALLOWED_ORIGIN;
  WS_ADMIN_USERNAME: string = process.env.WS_ADMIN_USERNAME;
  WS_ADMIN_PASSWORD: string = process.env.WS_ADMIN_PASSWORD
}

const requiredEnvs = new RequiredEnvs();

Object.entries(requiredEnvs).forEach(([key, value]) => {
  if (!value) throw(`Environment variable "${key}" is not defined`);
});
