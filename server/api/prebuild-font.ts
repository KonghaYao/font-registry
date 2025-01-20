import { serverSupabaseServiceRole, serverSupabaseUser } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/database.types";
import { decodeReporter } from "cn-font-split/dist/createAPI";
import { defineCompose } from "../utils/compose";
import { authRunner, useUser } from "../utils/auth";
import { useJSON, validateJSON } from "../utils/validation";
export const schema = z.object({
    name: z.string(),
});

export default defineCompose(authRunner, validateJSON(schema), async (event) => {
    const body: z.infer<typeof schema> = useJSON(event);
    const client = serverSupabaseServiceRole<Database>(event);
    const key = body.name;
    const pkg = await client.from("packages").select("id,latest,style,name").eq("name", key).single();
    if (!pkg.data) {
        return createError("Package not found");
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
            return createError("Version not found");
        }
        const assets = await client.from("assets").select("*").eq("version_id", version.data.id).select();
        const asset = assets.data?.[0];
        if (!asset) {
            return createError("Asset not found");
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
        const bin = await fetch("https://ik.imagekit.io/cnfont2" + file_folder + "reporter.bin").then((res) =>
            res.arrayBuffer()
        );
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
