import { hash } from "ohash";
export default defineCachedCompose(async (event) => {
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
    if (!data) {
        setResponseStatus(event, 404);
        return;
    }
    console.log("hit");
    setResponseHeader(event, "etag", "W/" + hash(extra));
    return data;
})({
    maxAge: 24 * 60 * 60,
});
