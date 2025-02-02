import { z } from "zod";
export const schema = z.object({
    url: z.string().url(),
});
export default defineCompose(authLayer, validateJSON(schema), async (event) => {
    const json: z.infer<typeof schema> = useJSON(event);
    const data = await fetch(json.url).then((res) => res.text());
    const htmlText = extractReadableContent(data) ?? data;
    const turndownService = new TurndownService({
        headingStyle: "atx",
    });
    const markdown = turndownService.turndown(htmlText);
    return markdown;
});
// plugins/readabilityService.js
import { Readability } from "@mozilla/readability";
import { Window } from "happy-dom";
import TurndownService from "turndown";
export function extractReadableContent(html: string) {
    // 创建一个新的 happy-dom 实例
    const window = new Window();
    const document = window.document;

    // 将字符串形式的HTML解析到document对象中
    document.write(html);
    // 使用 Readability 解析文档
    const parser = new Readability(document as any);
    const article = parser.parse();
    document.close();

    return article ? article.content : null;
}
