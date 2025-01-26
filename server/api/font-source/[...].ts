import { hash } from "ohash";
import { NotFoundError } from "~/server/utils/Errors";

export default defineCompose(async (event) => {
    const extra = event.path.split("/font-source/")[1];
    const store = useStorage("cache");
    if (await store.hasItem(extra)) {
        return store.getItemRaw(extra);
    }
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
    await store.setItemRaw(extra, new Uint8Array(await data.arrayBuffer()));
    setResponseHeader(event, "etag", "W/" + hash(extra));
    return data;
});
