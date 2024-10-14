import process from "node:process";
import { config } from "dotenv";

config();

function getEnv(input) {
  const result = process.env[input];
  if (!result) console.error(`Environment variable "${input}" is not defined`);
  return result;
}

export default getEnv;
