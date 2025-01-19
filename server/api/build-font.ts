import { serverSupabaseServiceRole } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/database.types";
import { decodeReporter } from "cn-font-split/dist/createAPI";
export const schema = z.object({
    name: z.string(),
    version: z.string(),
    assets_name: z.string(),
});

// 预构建字体，保证可以获取到
export default defineEventHandler(async (event) => {
    const body = await readValidatedBody(event, schema.safeParse);
    if (!body.data) {
        throw new Error("Invalid body");
    }
    const client = serverSupabaseServiceRole<Database>(event);
    const key = body.data.name;
    const pkg = await client.from("packages").select("id,latest,style,name").eq("name", key).single();
    if (!pkg.data) {
        throw new Error("Package not found");
    }
    const version = await client
        .from("versions")
        .select("*")
        .eq("package_id", pkg.data.id)
        .eq("version", body.data.version)
        .single();
    if (!version.data) {
        throw new Error("Version not found");
    }
    const assets = await client.from("assets").select("*").eq("version_id", version.data.id).select();
    const asset = assets.data?.[0];
    if (!asset) {
        throw new Error("Asset not found");
    }
    const file_folder = ("/packages/" + key + "/" + version.data.version + "/" + asset.assets_name + "/").replaceAll(
        ".",
        "_"
    );
    console.log("building", file_folder);
    await fetch(process.env.SPLIT_SERVER + "/upload", {
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
    const bin = await fetch(process.env.ASSETS_ROOT + file_folder + "reporter.bin").then((res) => res.arrayBuffer());
    const reporter = decodeReporter(new Uint8Array(bin));
    console.log("接入完成");
    const style = {
        version: version.data.version,
        file_name: asset.assets_name,
        file_folder,
        ...reporter.css.toObject(),
    };
    const restoreAsset = await client.from("assets").update({ is_published: true, style }).eq("id", asset.id).select();

    console.log("写入完成");
    if (restoreAsset.error) throw restoreAsset.error;
    return style;
});
