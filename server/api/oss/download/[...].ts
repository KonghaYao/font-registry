import { cacheLayer } from "~/server/utils/cache";
import { useAfterResponse } from "~/server/utils/compose";
import { getContentType } from "~/server/utils/contentType";
import { s3Client } from "~/server/utils/s3Client";
import type { Readable } from "node:stream";
export default defineCompose(
    (event) => {
        useAfterResponse(event, () => {
            getContentType(event.path, (type) => {
                setResponseHeader(event, "content-type", type);
            });
            setResponseHeader(event, "Cache-Control", "max-age=86400");
            setResponseHeader(event, "access-control-allow-origin", "*");
        });
    },
    cacheLayer(),
    async (event) => {
        const extra = event.path.split("/download/", 2)[1];
        const res = await s3Client.getObject("chinese-fonts", `origin/${decodeURIComponent(extra)}`, {});
        return readableToBlob(res);
    }
);
async function readableToBlob(readable: Readable) {
    // 收集所有的数据片断
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(chunk);
    }

    // 将所有数据片断合并成单一的Buffer
    const combinedBuffer = Buffer.concat(chunks);

    // 创建Blob对象，第二个参数是MIME类型，根据你的需求调整
    const blob = new Blob([combinedBuffer], { type: "application/octet-stream" });

    return blob;
}
