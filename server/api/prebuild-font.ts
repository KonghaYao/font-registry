import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/database.types";
import { decodeReporter } from "cn-font-split/dist/createAPI";
export const schema = z.object({
    name: z.string(),
    repo: z.string(),
});

// 预构建字体，保证可以获取到
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, schema.safeParse);
    if (!body.data) {
        throw new Error("Invalid body");
    }
    const client = serverSupabaseServiceRole<Database>(event);
    const key = `${body.data.name}/${body.data.repo}`;
    const pkg = await client.from("packages").select("id,latest,style,name").eq("name", key).single();
    if (!pkg.data) {
        throw new Error("Package not found");
    }

    const style = pkg.data.style;
    // @ts-ignore
    if (!style || style.version !== pkg.data.latest) {
        const version = await client
            .from("versions")
            .select("*")
            .eq("package_id", pkg.data.id)
            .eq("version", pkg.data.latest)
            .single();
        if (!version.data) {
            throw new Error("Version not found");
        }
        const assets = await client.from("assets").select("*").eq("version_id", version.data.id).select();
        const asset = assets.data?.[0];
        if (!asset) {
            throw new Error("Asset not found");
        }
        const file_folder = (
            "/packages/" +
            key +
            "/" +
            version.data.version +
            "/" +
            asset.assets_name +
            "/"
        ).replaceAll(".", "_");
        await fetch("https://cn-font-5hrt.shuttle.app/upload", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                file_url: asset.download_url,
                file_folder,
            }),
        })
            .then((res) => res.text())
            .then((res) => {
                console.log(res);
            });
        console.log("构建完成", file_folder);
        const bin = await fetch("https://ik.imagekit.io/cnfont" + file_folder + "reporter.bin").then((res) =>
            res.arrayBuffer()
        );
        const reporter = decodeReporter(new Uint8Array(bin));
        const style = {
            version: pkg.data.latest,
            file_name: asset.assets_name,
            file_folder,
            ...reporter.css.toObject(),
        };
        const { error } = await client.from("packages").update({ style }).eq("id", pkg.data.id).select();
        if (error) throw error;
        const restoreAsset = await client.from("assets").update({ is_published: true }).eq("id", asset.id).select();
        if (restoreAsset.error) throw restoreAsset.error;
        return style;
    }
    return style;
});
