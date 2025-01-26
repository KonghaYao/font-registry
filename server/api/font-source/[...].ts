import { cacheLayer } from "~/server/utils/cache";
import { NotFoundError } from "~/server/utils/Errors";

export default defineCompose(
    (event) => {
        useAfterResponse(event, () => {
            setResponseHeader(event, "Cache-Control", "max-age=86400");
            setResponseHeader(event, "access-control-allow-origin", "*");
        });
    },
    cacheLayer(),
    async (event) => {
        const extra = event.path.split("/font-source/")[1];
        const data = await fetch(process.env.OSS_ROOT + "/" + extra).then((res) => {
            if (!res.ok) {
                return null;
            }
            const contentType = res.headers.get("Content-Type");
            if (contentType) {
                setResponseHeader(event, "Content-Type", contentType);
            }
            return res.blob();
        });
        if (!data) throw new NotFoundError();
        return data;
    }
);
