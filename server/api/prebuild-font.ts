import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/database.types";
import { decodeReporter } from "cn-font-split/dist/createAPI";
import { defineCompose } from "../utils/compose";
import { authRunner, useUser } from "../utils/auth";
import { useJSON, validateJSON } from "../utils/validation";
export type InputSchema = z.infer<typeof schema>;
export const schema = z.object({
    name: z.string(),
    force: z.optional(z.boolean()),
});

export default defineCompose(authRunner, validateJSON(schema), async (event) => {
    const body: z.infer<typeof schema> = useJSON(event);
    const client = serverSupabaseServiceRole<Database>(event);
    const key = body.name;
    const pkg = await client.from("packages").select("id,latest,style,name").eq("name", key).single();
    if (!pkg.data) return createError("Package not found");

    const style = pkg.data.style;
    // @ts-ignore
    if (!style || style.version !== pkg.data.latest || body.force) {
        const version = await client
            .from("versions")
            .select("*")
            .eq("package_id", pkg.data.id)
            .eq("version", pkg.data.latest)
            .single();
        if (!version.data) return createError("Version not found");

        const assets = await client.from("assets").select("*").eq("version_id", version.data.id).select();
        const asset = assets.data?.[0];
        if (!asset) return createError("Asset not found");

        const file_folder = (
            "/packages/" +
            key +
            "/" +
            version.data.version +
            "/" +
            asset.assets_name +
            "/"
        ).replaceAll(".", "_");
        console.log(asset.download_url);
        await fetch(process.env.SPLIT_SERVER + "/upload", {
            method: "POST",
            headers: {
                authorization:
                    "Bearer " + (await sha256(process.env.SPLIT_SERVER_TOKEN! + Math.floor(Date.now() / 10000))),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                file_url: new URL(asset.download_url, process.env.WEBSITE_URL),
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
        const { error } = await client.from("packages").update({ style }).eq("id", pkg.data.id).select();
        if (error) throw error;
        const restoreAsset = await client
            .from("assets")
            .update({ is_published: true, style })
            .eq("id", asset.id)
            .select();
        if (restoreAsset.error) throw restoreAsset.error;
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
