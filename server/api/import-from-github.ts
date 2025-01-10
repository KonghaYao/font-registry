import { serverSupabaseUser } from "#supabase/server";
import { Octokit, RestEndpointMethodTypes } from "@octokit/rest";
import z from "zod";
import { serverSupabaseClient } from "#supabase/server";
const octokit = new Octokit({});
export const schema = z.object({
    name: z.string(),
    repo: z.string(),
});

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event);
    if (!user)
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    const params = await readValidatedBody(event, schema.safeParse);
    if (!params.data) {
        throw createError({ statusCode: 400, statusMessage: "Bad Request" });
    }
    const client = await serverSupabaseClient(event);
    // 查询有无该包

    const response = await octokit.repos.listReleases({
        owner: params.data.name,
        repo: params.data.repo,
    });
    const githubReadMe = "";
    const key = params.data.name + "/" + params.data.repo;
    const userId = user.id;

    // 注入版本表
    const dataList = response.data.map(convertReleaseToPackage(key, userId));
    const { data, error } = await client
        .from("versions")
        .insert(dataList as any)
        .select();

    if (error) {
        throw createError({ statusCode: 400, statusMessage: error.message });
    }

    const assets = response.data.flatMap((release, index) =>
        release.assets
            .filter((i) => {
                return (
                    i.state === "uploaded" &&
                    (i.content_type.startsWith("font/") ||
                        ["otf", "ttf", "woff2"].some((ext) =>
                            i.name.endsWith(ext)
                        ))
                );
            })
            .map((asset) => ({
                package_id: data[index].id,
                assets_name: asset.name,
                size: asset.size,
                download_url: asset.browser_download_url,
                user_id: userId,
            }))
    );
    // 注入资源表
    const assetsInsert = await client
        .from("assets")
        .insert(assets as any)
        .select();

    if (assetsInsert.error)
        throw createError({
            statusCode: 400,
            statusMessage: assetsInsert.error.message,
        });

    return {
        statusCode: 200,
        message: "success",
        test: { response },
        data: {
            package: key,
            version: data,
            assets: assetsInsert.data,
        },
    };
});
const convertReleaseToPackage =
    (packageId: string, userId: string) =>
    (
        release: NonNullable<
            RestEndpointMethodTypes["repos"]["listReleases"]["response"]["data"]
        >[number]
    ) => {
        // 默认值设置
        return {
            created_at: release.published_at, // 转换为 Date 对象
            package_id: packageId,
            version: release.tag_name, // 使用 tag_name 作为版本号
            description: "#" + release.name + "\n" + release.body || "", // 没有直接对应的属性，使用默认值
            user_id: userId,
        };
    };
