import { defineCompose } from "../../utils/compose";
// import ImageKit from "imagekit";
import { sha256 } from "~/server/utils/sha256";

// 下载 zip 内的文件
const api = defineCompose(authLayer, async (event) => {
    const imagekit = {};
    // const imagekit = new ImageKit({
    //     publicKey: process.env.VITE_PK!,
    //     privateKey: process.env.VITE_SK!,
    //     urlEndpoint: "https://ik.imagekit.io/basefont",
    // });
    const data = await readFormData(event);

    const file = data.get("file") as File;
    const name = data.get("name") as string;
    const binary = new Uint8Array(await file.arrayBuffer());
    const sha = await sha256(binary);
    await imagekit.upload({
        file: Buffer.copyBytesFrom(binary),
        fileName: name,
        folder: `/origin/${sha}`,
        useUniqueFileName: false,
    });
    return {
        status: "success",
        message: "File uploaded successfully.",
        fileUrl: useRuntimeConfig().NUXT_WEBSITE_URL + `/api/oss/download/${sha}/${name}`,
        fileId: sha,
        fileSize: file.size,
    };
});
export default api;
