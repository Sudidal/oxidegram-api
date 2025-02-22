import process from "process";

import { createClient } from "@supabase/supabase-js";
import { v4 } from "uuid";

class SupabaseAPI {
  #client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
  constructor() {}

  uploadFile = async (bucket: string, file: Buffer, path: string, contentType: string) => {
    try {
      const res = await this.#client.storage
        .from(bucket)
        .upload(path + v4(), file, {
          contentType: contentType,
        });
      if (res.error) {
        throw res.error;
      }
      return res;
    } catch (err) {
      throw err;
    }
  };
  getFileUrl = async (bucket: string, name: string) => {
    const url = this.#client.storage.from(bucket).getPublicUrl(name);
    return url;
  };
}

const supabaseApi = new SupabaseAPI();
export default supabaseApi;
