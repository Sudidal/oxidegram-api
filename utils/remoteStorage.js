import supabaseApi from "./supabaseAPI.js";

class RemoteStorage {
  constructor() {}

  uploadPostFile = async (file) => {
    console.log(file);
    let dirName = "images";
    const fileMimeType = file.mimetype.split("/");
    if (fileMimeType[0] === "image") {
      dirName = "images";
    } else if (fileMimeType[0] === "video") {
      dirName = "videos";
    }
    return await this.uploadAndGetUrl(file, dirName, "posts");
  };
  uploadAvatarImage = async (file) => {
    return await this.uploadAndGetUrl(file, "avatars");
  };

  uploadAndGetUrl = async (file, dir = "", bucket) => {
    try {
      const uploadRes = await supabaseApi.uploadFile(
        bucket,
        file.buffer,
        dir + "/" + file.originalname,
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
