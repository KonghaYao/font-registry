import { RemoteRequestError } from "~/server/utils/Errors";

export default defineCompose(authLayer, async (event) => {
    const extra = event.path.split("/ai/", 2)[1];
    const body = await readRawBody(event, "utf-8");
    console.log(extra);
    const data = await fetch("https://bot-endpoint.netlify.app/" + extra, {
        headers: {
            accept: "*/*",
            "content-type": "application/json",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: `Bearer ${await encryptToken(useRuntimeConfig().NUXT_AI_TOKEN)}`,
        },
        method: "post",
        body,
    });
    if (!data.ok) {
        throw new RemoteRequestError(data, await data.text());
    }
    return sendWebResponse(event, new Response(data.body));
});
// 定义encryptToken函数
const encryptToken = (token: string, timespace = 60 * 1000) => {
    return sha256(token + Math.floor(Date.now() / timespace));
};
