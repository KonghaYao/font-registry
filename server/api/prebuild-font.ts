import { serverSupabaseServiceRole } from "#supabase/server";
import z from "zod";
import { Database } from "~/types/database.types";
import { decodeReporter } from "cn-font-split/dist/createAPI";
import { defineCompose } from "../utils/compose";
import { authLayer } from "../utils/auth";
import { useJSON, validateJSON } from "../utils/validation";
import { NetworkResourceError, NotFoundError, useSupabaseQuery } from "../utils/Errors";
import { clearCacheLayer } from "../utils/cache";
import { sha256 } from "../utils/sha256";
export type InputSchema = z.infer<typeof schema>;
export const schema = z.object({
    name: z.string(),
    /** 如果填入，则为精确版本构建 */
    version: z.optional(z.string()),
    /** 如果填入，则为精确版本构建 */
    assets_name: z.optional(z.string()),
    force: z.optional(z.boolean()),
});

export default defineCompose(
    authLayer,
    validateJSON(schema),
    // 清除隔壁的 版本查询接口 缓存，保证及时获取到信息
    clearCacheLayer((event, result: { pkgId: string; name: string }) => {
        return [
            `nitro:functions:_:version:${result.pkgId}.json`,
            `nitro:handlers:_:_api_packages_get_pkgKey_${result.name.replace("/", "_")}.json`,
        ];
    }),
    async (event) => {
        const body: z.infer<typeof schema> = useJSON(event);
        const client = serverSupabaseServiceRole<Database>(event);
        const key = body.name;
        const pkg = useSupabaseQuery(
            await client.from("packages").select("id,latest,style,name").eq("name", key).single()
        );

        const style = pkg.data.style as {
            family?: string;
            style?: string;
            weight?: string;
            display?: string;
            version: string | null;
            file_name: string;
            file_folder: string;
        };
        const isAccurate = body.version && body.assets_name;
        // @ts-ignore
        if (!style || style.version !== pkg.data.latest || body.force || isAccurate) {
            const versionName = body.version ?? pkg.data.latest;
            const item = versionName
                ? await client
                      .from("versions")
                      .select("*")
                      .eq("package_id", pkg.data.id)
                      .eq("version", versionName)
                      .single()
                : await client
                      .from("versions")
                      .select("*")
                      .eq("package_id", pkg.data.id)
                      .order("created_at", {
                          ascending: false,
                      })
                      .limit(1)
                      .single();
            const version = useSupabaseQuery(item);
            const chain = client
                .from("assets")
                .select("*")
                .eq("version_id", version.data.id)
                .order("created_at", { ascending: false })
                .limit(1);

            const assets = useSupabaseQuery(
                await (isAccurate ? chain.eq("assets_name", body.assets_name!).single() : chain.single()),
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
            const file_url = new URL(asset.download_url, useRuntimeConfig().NUXT_WEBSITE_URL).toString();
            console.log(file_url);
            await fetch(useRuntimeConfig().NUXT_SPLIT_SERVER + "/upload", {
                method: "POST",
                headers: {
                    authorization:
                        "Bearer " +
                        (await sha256(useRuntimeConfig().NUXT_SPLIT_SERVER_TOKEN! + Math.floor(Date.now() / 10000))),
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    file_url,
                    file_folder,
                }),
            })
                .then((res) => {
                    if (!res.ok)
                        throw new NetworkResourceError(
                            "访问资源报错 " + useRuntimeConfig().NUXT_SPLIT_SERVER + "/upload" + " " + res.statusText
                        );
                    return res.text();
                })
                .then((res) => {
                    console.log(res);
                });

            console.log("构建完成", file_folder);

            const reporterPath = useRuntimeConfig().NUXT_OSS_ROOT + file_folder + "reporter.bin";
            const bin = await fetch(reporterPath).then((res) => {
                if (!res.ok) throw new NetworkResourceError("访问资源报错 " + reporterPath);
                return res.arrayBuffer();
            });
            const reporter = decodeReporter(new Uint8Array(bin));
            console.log(reporterPath);
            const style = {
                version: version.data.version,
                file_name: asset.assets_name,
                file_folder,
                ...reporter.css.toObject(),
            };
            if (!isAccurate)
                useSupabaseQuery(
                    await client
                        .from("packages")
                        .update({ style, latest: !versionName ? version.data.version || undefined : undefined })
                        .eq("id", pkg.data.id)
                        .select()
                );

            useSupabaseQuery(
                await client.from("assets").update({ is_published: true, style }).eq("id", asset.id).select()
            );
            return { ...style, pkgId: pkg.data.id.toString(), name: body.name };
        }
        return { ...style, pkgId: pkg.data.id.toString(), name: body.name };
    }
);
