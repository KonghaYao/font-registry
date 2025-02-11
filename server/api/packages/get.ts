import z from "zod";
import { defineCachedCompose } from "../../utils/compose";
import { validateQuery, useJSON } from "../../utils/validation";
import { serverSupabaseServiceRole } from "#supabase/server";
import { H3Event } from "h3";
import { encodeKey } from "~/server/utils/cache";
import { base64ToUtf8 } from "../../utils/base64ToUtf8";
export const schema = z.object({
    /* 查询参数 */
    pkgKey: z.string(),
});

const api = defineCachedCompose(validateQuery(schema), async (event) => {
    const data: z.infer<typeof schema> = useJSON(event);
    const client = serverSupabaseServiceRole(event);
    let chain = useSupabaseQuery(
        await client.from("packages").select("*, author!left(*)").eq("name", data.pkgKey).single()
    );
    // chain.data
    if (chain.data?.readme && !chain.data.readme.includes(" ")) {
        chain.data.readme = base64ToUtf8(chain.data.readme) as string;
        if (chain.data.from === "github_api") {
            chain.data.readme = replaceSrcSetWithAbsoluteUrl(
                chain.data.readme,
                "https://ik.imagekit.io/github/" + data.pkgKey + "/raw/HEAD/"
            );
        }
    }
    return chain.data;
})({
    maxAge: 10 * 60,
    getKey: (event: H3Event) => {
        return encodeKey(event.node.req.url);
    },
});
export default api;

function replaceSrcSetWithAbsoluteUrl(html: string, baseUrl: string) {
    // 正则表达式匹配 <source> 标签中的 srcset 属性及其值
    const srcsetRegex = /<source[^>]*?srcset=["']([^"']*)["'][^>]*>/gi;
    // 替换 srcset 中的相对 URL 为绝对路径 URL
    return html.replace(srcsetRegex, (match: string, p1: string) => {
        // 对于每个匹配项，我们再次使用正则表达式来处理 srcset 的值
        const urls = p1.split(",").map((urlDesc) => {
            let [url, descriptor] = urlDesc.trim().split(/\s+/).reverse();
            if (!/^https?:\/\//i.test(url)) {
                // 如果不是以 http 或 https 开头，则认为是相对路径
                url = new URL(url, baseUrl).href; // 将其转换为绝对路径
            }
            return [descriptor, url].filter(Boolean).reverse().join(" ");
        });
        // 返回新的 <source> 标签，其中 srcset 已经更新为绝对路径
        return match.replace(p1, urls.join(", "));
    });
}
