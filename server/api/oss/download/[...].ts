import { cacheLayer } from "~/server/utils/cache";
import { useAfterResponse } from "~/server/utils/compose";
import { getContentType } from "~/server/utils/contentType";
import { s3Client } from "~/server/utils/s3Client";

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
        const res = await s3Client.getObject("chinese-fonts", `origin/${decodeURIComponent(extra)}`);
        return res;
    }
);
