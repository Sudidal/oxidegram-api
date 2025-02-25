import supabaseApi from "./supabaseAPI.ts";

type MulterFile = Express.Multer.File

class RemoteStorage {
  constructor() {}

  uploadPostFile = async (file: MulterFile) => {
    if (!file) return;

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

  uploadAvatarImage = async (file: MulterFile) => {
    return await this.uploadAndGetUrl(file, "", "avatars");
  };

  uploadAndGetUrl = async (file: MulterFile, dir = "", bucket: string) => {
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
      } catch (err: any) {
        return new Error(err);
      }
    } catch (err: any) {
      return new Error(err.error.message);
    }
  };
}

const remoteStorage = new RemoteStorage();
export default remoteStorage;
