import { octokit } from "../utils/github-endpoint";
import z from "zod";
import { uniqBy } from "lodash-es";
import { serverSupabaseServiceRole } from "#supabase/server";
import { RestEndpointMethodTypes } from "@octokit/rest";
import { Database } from "~/types/database.types";
import { defineCompose } from "../utils/compose";
import { authLayer, useUser } from "../utils/auth";
import { useJSON, validateJSON } from "../utils/validation";
import { sseResponse, useSSE } from "../utils/useSSE";
import { useSupabaseQuery } from "../utils/Errors";
import { clearCacheLayer } from "../utils/cache";
export type InputSchema = z.infer<typeof schema>;
export const schema = z.object({
    name: z.string(),
    repo: z.string(),
    name_cn: z.string(),
});

/** 从 github 更新数据 */
export default defineCompose(
    authLayer,
    validateJSON(schema),
    clearCacheLayer((event, result) => {
        return ["nitro:handlers:_:_api_packages_list.json"];
    }),
    sseResponse(async (event) => {
        const sse = useSSE(event);
        const user = useUser(event)!;
        const params: z.infer<typeof schema> = useJSON(event);
        const client = serverSupabaseServiceRole<Database>(event);
        // 查询有无该包
        const userId = user.id;

        const repo = await octokit.repos.get({
            owner: params.name,
            repo: params.repo,
        });
        sse.log("找到 github 仓库 " + repo.data.full_name);
        const author = useSupabaseQuery(
            await client
                .from("authors")
                .upsert(
                    [
                        {
                            name: repo.data.owner.login,
                            name_cn: repo.data.owner.login || repo.data.owner.name,
                            avatar: repo.data.owner.avatar_url,
                            link: repo.data.owner.html_url,
                        },
                    ],
                    { onConflict: "name" }
                )
                .select()
        );

        sse.log("找到 author  " + author.data[0].name);

        const readme = await octokit.repos.getReadme({
            owner: params.name,
            repo: params.repo,
        });

        sse.log("找到 Readme 文件  " + readme.data.path);

        const pack = useSupabaseQuery(
            await client
                .from("packages")
                .upsert(
                    [
                        {
                            name: repo.data.full_name,
                            description: repo.data.description,
                            homepage: repo.data.homepage || repo.data.html_url,
                            keywords: repo.data.topics || [],
                            readme: readme.data.content,
                            latest: "",
                            name_cn: params.name_cn,
                            license: repo.data.license?.name,
                            user_id: userId,
                            from: "github_api",
                            author: author.data[0].id,
                        },
                    ],
                    { onConflict: "name" }
                )
                .select()
        );
        const pId = pack.data[0].id;
        sse.log(`导入 github packages 成功  ${pId} ${pack.data[0].name_cn}`);

        const response = await octokit.repos.listReleases({
            owner: params.name,
            repo: params.repo,
        });

        // 注入版本表
        const dataList = response.data.map(convertReleaseToPackage(pId, userId));
        sse.log(`找到版本 github release ${dataList.length} 个`);

        await client
            .from("packages")
            .update({
                latest: response.data[0].tag_name,
            })
            .eq("id", pId)
            .select();

        const versionResult = useSupabaseQuery(
            await client
                .from("versions")
                .upsert(dataList as any, { onConflict: "package_id,version" })
                .select()
        );
        sse.log(`导入 github release ${versionResult.data.length} 个`);

        const assets = [];
        for (let index = 0; index < response.data.length; index++) {
            const release = response.data[index];
            let zipFiles: any[] = [];
            let assetIds = release.assets.filter((i) => {
                if (i.content_type === "application/zip" || i.name.endsWith(".zip")) zipFiles.push(i);
                return (
                    i.state === "uploaded" &&
                    (i.content_type.startsWith("font/") || ["otf", "ttf"].some((ext) => i.name.endsWith(ext)))
                );
            });

            for (const zipFile of zipFiles) {
                const zip = new ZIPPath(zipFile.browser_download_url);
                const filePaths = await zip.getPaths();
                filePaths.forEach(({ name: path, size }) => {
                    if (["otf", "ttf"].some((ext) => path.endsWith(ext))) {
                        /**@ts-ignore */
                        assetIds.push({
                            name: path,
                            browser_download_url: `/api/zip/get?url=${encodeURIComponent(
                                zipFile.browser_download_url
                            )}&path=${encodeURIComponent(path)}`,
                            size: size,
                        });
                    }
                });
            }

            // 使用 lodash 的 uniqBy 或其他方法去重
            const uniqueAssets = uniqBy(
                assetIds.map((asset) => ({
                    version_id: versionResult.data[index].id,
                    assets_name: asset.name,
                    size: asset.size,
                    download_url: asset.browser_download_url,
                    user_id: userId,
                })),
                (i) => i.assets_name
            );
            // 注入资源表
            const assetsInsert = useSupabaseQuery(
                await client
                    .from("assets")
                    .upsert(uniqueAssets as any, {
                        onConflict: "version_id,assets_name",
                    })
                    .select()
            );
            sse.log(`导入 github assets ${assetsInsert.data?.length} 个 | ${versionResult.data[index].version}`);
            // 将当前循环的结果添加到最终的 assets 数组中
            assets.push(...assetsInsert.data);
        }

        useSupabaseQuery(
            await client
                .from("packages")
                .update({
                    is_published: true,
                })
                .eq("id", pId)
        );
        return {
            package: pack.data[0],
            version: versionResult.data,
            assets: assets,
        };
    })
);

const convertReleaseToPackage =
    (packageId: number, userId: string) =>
    (release: NonNullable<RestEndpointMethodTypes["repos"]["listReleases"]["response"]["data"]>[number]) => {
        // 默认值设置
        return {
            created_at: release.published_at, // 转换为 Date 对象
            package_id: packageId,
            version: release.tag_name, // 使用 tag_name 作为版本号
            description: "#" + release.name + "\n" + release.body || "", // 没有直接对应的属性，使用默认值
            user_id: userId,
        };
    };
