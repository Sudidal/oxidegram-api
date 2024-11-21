import { createClient } from "@supabase/supabase-js";
import { v4 } from "uuid";
import getEnv from "./getEnv.js";

class SupabaseAPI {
  #client = createClient(getEnv("SUPABASE_URL"), getEnv("SUPABASE_KEY"));
  constructor() {}

  uploadFile = async (bucket, file, name, contentType) => {
    try {
      const res = await this.#client.storage.from(bucket).upload(v4(), file, {
        contentType: contentType,
      });
      if (res.error) {
        throw res;
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
  getFileUrl = async (bucket, name) => {
    const res = this.#client.storage.from(bucket).getPublicUrl(name);
    if (res.error) {
      throw res;
    }
    return res;
  };
}

const supabaseApi = new SupabaseAPI();
export default supabaseApi;
