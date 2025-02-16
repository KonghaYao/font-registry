<script lang="ts" setup>
import prettyBytes from "pretty-bytes";
import type VersionList from "#server-endpoint/api/version/list.ts";
import type PreBuild from "#server-endpoint/api/prebuild-font.ts";
const props = defineProps<{
    pkgId: number;
    pkgName: string;
    can_download: boolean;
}>();
const isSuper = useSuperMode();
const prebuild = useAsyncJSON<PreBuild.Input, PreBuild.Output>(
    () => ({
        url: "/api/prebuild-font",
        method: "post",
    }),
    {
        onSuccess(data, input) {
            isNeedForceRefresh.value = true;
            allVersions.fetch({ pkgId: props.pkgId.toString() }).then(() => {
                isNeedForceRefresh.value = false;
            });
        },
    }
);
let isNeedForceRefresh = ref(false);
const allVersions = useAsyncJSON<VersionList.Input, VersionList.Output>(
    async () => {
        return {
            url: "/api/version/list",
        };
    },
    {
        onSuccess(data) {
            console.log(data);
        },
        cache() {
            return isNeedForceRefresh.value ? "no-cache" : undefined;
        },
    }
);
const { copy } = useCopyToClipboard();
onMounted(() => {
    allVersions.fetch({ pkgId: props.pkgId.toString() });
});
defineExpose({
    fetch() {
        !allVersions.data && allVersions.fetch({ pkgId: props.pkgId.toString() });
    },
});
</script>
<template>
    <ul class="flex flex-col gap-4 version-panel">
        <li class="border-b border-gray-300 py-4" v-for="(item, index) in allVersions.data?.data!">
            <div class="text-3xl font-bold leading-tight text-gray-900 flex items-center justify-between mb-4">
                <span>
                    {{ item.version }}
                </span>

                <div class="flex-1"></div>
                <span class="text-gray-600 text-sm px-4">
                    {{ new Date(item.created_at).toLocaleString() }}
                </span>
            </div>
            <ul>
                <li
                    v-for="(asset, index) in item.assets.sort((a:any, b:any) => b.assets_name.localeCompare(a.assets_name))"
                    class="flex justify-between gap-4 hover:bg-primary-50 transition-all px-4"
                >
                    <span>
                        {{ asset.assets_name }}
                    </span>
                    <div class="flex-1"></div>
                    <span class="text-gray-500 flex-none">
                        <!-- 文件 icon -->
                        <UIcon name="icon-park-outline:file-collection-one" class="w-5 h-5" />
                        <span class="inline-block w-20 text-right">
                            {{ prettyBytes(asset.size) }}
                        </span>
                    </span>
                    <a
                        target="_blank"
                        v-if="isSuper || can_download"
                        :href="asset.download_url"
                        class="text-primary-500 flex-none"
                    >
                        <UIcon name="icon-park-outline:download-one" class="w-5 h-5" />
                        <span> 下载文件 </span>
                    </a>
                    <div
                        class="text-purple-800 cursor-pointer flex-none"
                        @click="() => {
                            copy(createFontLink(pkgName, item.version!, asset.assets_name))
                            ElMessage.success('复制成功');
                        }"
                        v-if="asset.is_published"
                    >
                        <UIcon name="vscode-icons:file-type-css" class="w-5 h-5" />
                        <span> CSS 链接 </span>
                    </div>
                    <div
                        class="text-purple-800/50 cursor-pointer flex-none"
                        v-loading="prebuild.loading"
                        @click="
                            () => {
                                ElMessage.success('构建中，请稍等');
                                prebuild.fetch({
                                    name: pkgName,
                                    version: item.version,
                                    assets_name: asset.assets_name,
                                });
                            }
                        "
                        v-else
                    >
                        <UIcon name="vscode-icons:file-type-css" class="w-5 h-5" />
                        <span> 构建 CSS </span>
                    </div>
                </li>
            </ul>
        </li>
    </ul>
</template>
<style>
.version-panel .iconify {
    vertical-align: sub;
}
</style>
