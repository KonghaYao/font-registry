import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/database.types";
import { decodeReporter } from "cn-font-split/dist/createAPI";
import { defineCompose } from "../utils/compose";
import { authLayer, useUser } from "../utils/auth";
import { useJSON, validateJSON } from "../utils/validation";
import { useSupabaseQuery } from "../utils/Errors";
export type InputSchema = z.infer<typeof schema>;
export const schema = z.object({
    name: z.string(),
    force: z.optional(z.boolean()),
});

export default defineCompose(authLayer, validateJSON(schema), async (event) => {
    const body: z.infer<typeof schema> = useJSON(event);
    const client = serverSupabaseServiceRole<Database>(event);
    const key = body.name;
    const pkg = useSupabaseQuery(await client.from("packages").select("id,latest,style,name").eq("name", key).single());

    const style = pkg.data.style;
    // @ts-ignore
    if (!style || style.version !== pkg.data.latest || body.force) {
        const version = useSupabaseQuery(
            await client
                .from("versions")
                .select("*")
                .eq("package_id", pkg.data.id)
                .eq("version", pkg.data.latest)
                .single()
        );

        const assets = useSupabaseQuery(
            await client
                .from("assets")
                .select("*")
                .eq("version_id", version.data.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .single(),
            (res) => {
                if (!res.data) {
                    throw new NotFoundError("Asset not found");
                }
            }
        );
        const asset = assets.data;
        const file_folder = (
            "/packages/" +
            key +
            "/" +
            version.data.version +
            "/" +
            asset.assets_name +
            "/"
        ).replaceAll(".", "_");
        const file_url = new URL(asset.download_url, process.env.WEBSITE_URL).toString();
        console.log(file_url);
        await fetch(process.env.SPLIT_SERVER + "/upload", {
            method: "POST",
            headers: {
                authorization:
                    "Bearer " + (await sha256(process.env.SPLIT_SERVER_TOKEN! + Math.floor(Date.now() / 10000))),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                file_url,
                file_folder,
            }),
        })
            .then((res) => res.text())
            .then((res) => {
                console.log(res);
            });

        console.log("构建完成", file_folder);

        const bin = await fetch(process.env.OSS_ROOT + file_folder + "reporter.bin").then((res) => res.arrayBuffer());

        const reporter = decodeReporter(new Uint8Array(bin));
        const style = {
            version: version.data.version,
            file_name: asset.assets_name,
            file_folder,
            ...reporter.css.toObject(),
        };
        useSupabaseQuery(await client.from("packages").update({ style }).eq("id", pkg.data.id).select());

        const restoreAsset = useSupabaseQuery(
            await client.from("assets").update({ is_published: true, style }).eq("id", asset.id).select()
        );
        return style;
    }
    return style;
});
async function sha256(message: string) {
    // 将输入字符串转换为 UTF-8 编码的 Uint8Array
    const encoder = new TextEncoder();
    const data = encoder.encode(message);

    // 使用 crypto.subtle 模块来计算 SHA-256 哈希值
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // 将 ArrayBuffer 转换为十六进制字符串表示形式
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
}
