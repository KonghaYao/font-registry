import { octokit } from "../utils/github-endpoint";
import z from "zod";
import { serverSupabaseClient } from "#supabase/server";
import { RestEndpointMethodTypes } from "@octokit/rest";
import { Database } from "~/types/database.types";
import { defineCompose } from "../utils/compose";
import { authRunner, useUser } from "../utils/auth";
import { useJSON, validateJSON } from "../utils/validation";
export const schema = z.object({
    name: z.string(),
    repo: z.string(),
    name_cn: z.string(),

});

/** 从 github 更新数据 */
export default defineCompose(authRunner, validateJSON(schema), async (event) => {
    const user = useUser(event)!;
    const params: z.infer<typeof schema> = useJSON(event);
    const client = await serverSupabaseClient<Database>(event);
    // 查询有无该包
    const userId = user.id;
    const repo = await octokit.repos.get({
        owner: params.name,
        repo: params.repo,
    });
    const readme = await octokit.repos.getReadme({
        owner: params.name,
        repo: params.repo,
    });

    const pack = await client
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
                },
            ],
            { onConflict: "name" }
        )
        .select();
    if (pack.error) {
        return createError({
            statusCode: 400,
            statusMessage: pack.error.message,
        });
    }
    const pId = pack.data[0].id;

    const response = await octokit.repos.listReleases({
        owner: params.name,
        repo: params.repo,
    });

    // 注入版本表
    const dataList = response.data.map(convertReleaseToPackage(pId, userId));

    await client
        .from("packages")
        .update({
            latest: response.data[0].tag_name,
        })
        .eq("id", pId)
        .select();
    const { data, error } = await client
        .from("versions")
        .upsert(dataList as any, { onConflict: "package_id,version" })
        .select();

    if (error) {
        return createError({ statusCode: 400, statusMessage: error.message });
    }

    const assets = response.data.flatMap((release, index) =>
        release.assets
            .filter((i) => {
                return (
                    i.state === "uploaded" &&
                    (i.content_type.startsWith("font/") || ["otf", "ttf", "woff2"].some((ext) => i.name.endsWith(ext)))
                );
            })
            .map((asset) => ({
                version_id: data[index].id,
                assets_name: asset.name,
                size: asset.size,
                download_url: asset.browser_download_url,
                user_id: userId,
            }))
    );
    // 注入资源表
    const assetsInsert = await client
        .from("assets")
        .upsert(assets as any, {
            onConflict: "version_id,assets_name",
        })
        .select();

    if (assetsInsert.error)
        return createError({
            statusCode: 400,
            statusMessage: assetsInsert.error.message,
        });

    return {
        statusCode: 200,
        message: "success",
        // test: { response, repo },
        data: {
            package: pack.data[0],
            version: data,
            assets: assetsInsert.data,
        },
    };
});



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
