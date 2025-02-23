import process from "node:process";
import { config } from "dotenv";

config();

/** @deprecated */
function getEnv(input: string) {
  const result = process.env[input];
  if (!result) console.error(`Environment variable "${input}" is not defined`);
  return result;
}

export default getEnv;
