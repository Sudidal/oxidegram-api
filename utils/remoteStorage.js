import supabaseApi from "./supabaseAPI.js";

class RemoteStorage {
  constructor() {}

  uploadPostImage = async (file) => {
    return await this.uploadAndGetUrl(file, "posts");
  };
  uploadAvatarImage = async (file) => {
    return await this.uploadAndGetUrl(file, "avatars");
  };

  uploadAndGetUrl = async (file, bucket) => {
    try {
      const uploadRes = await supabaseApi.uploadFile(
        bucket,
        file.buffer,
        file.originalname,
        file.mimetype
      );
      try {
        const urlRes = await supabaseApi.getFileUrl(
          bucket,
          uploadRes.data.path
        );
        return urlRes.data.publicUrl;
      } catch (err) {
        return new Error(err.error.message);
      }
    } catch (err) {
      return new Error(err.error.message);
    }
  };
}

const remoteStorage = new RemoteStorage();
export default remoteStorage;
