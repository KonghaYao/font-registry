// 转移到 https://github.com/KonghaYao/awesome-deno-deploy-script/blob/main/website-to-md/index.ts
// netlify edge 和很多 js runtime 对 dom 的支持不太好

export default defineCompose(async (event) => {
    return fetch("https://website-to-md.deno.dev", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: await readRawBody(event),
    }).then((res) => res.text());
});
