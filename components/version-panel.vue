<script lang="ts" setup>
import prettyBytes from "pretty-bytes";
import type { Database } from "~/types/database.types";
const props = defineProps<{
    pkgId: number;
    pkgName: string;
}>();
const client = useSupabaseClient<Database>();
const allVersions = useAsyncAction(
    async () => {
        const id = props.pkgId!;
        return client.from("versions").select("*, assets!inner(*)").eq("package_id", id);
    },
    {
        onSuccess(data) {
            console.log(data);
        },
    }
);
const { copy } = useCopyToClipboard();
onMounted(() => {
    allVersions.fetch(null);
});
defineExpose({
    fetch() {
        !allVersions.data && allVersions.fetch(null);
    },
});
</script>
<template>
    <ul class="flex flex-col gap-4">
        <li class="border-b border-gray-300 py-4" v-for="(item, index) in allVersions.data?.data!">
            <el-popover width="50%" trigger="click" placement="bottom">
                <template #reference>
                    <div class="text-3xl font-bold leading-tight text-gray-900 flex items-center justify-between mb-4">
                        <span>
                            {{ item.version }}
                        </span>

                        <div class="flex-1"></div>
                        <span class="text-gray-600 text-sm px-4">
                            {{ new Date(item.created_at).toLocaleString() }}
                        </span>
                        <!-- info 图标 -->
                        <UIcon name="material-symbols:info-rounded" class="w-5 h-5 text-gray-600 cursor-pointer" />
                    </div>
                </template>
                <div class="text-xl font-bold my-2">版本说明</div>
                <MDC class="markdown-body py-4" :value="item.description || ''" tag="div" />
            </el-popover>

            <ul>
                <li
                    v-for="(asset, index) in item.assets"
                    class="flex justify-between gap-4 hover:bg-primary-50 transition-all px-4"
                >
                    <span>
                        {{ asset.assets_name }}
                    </span>
                    <div class="flex-1"></div>
                    <span>
                        <!-- 文件 icon -->
                        <UIcon name="material-symbols:file-present-rounded" class="w-4 h-4" />
                        {{ prettyBytes(asset.size) }}
                    </span>
                    <NuxtLink :to="asset.download_url" class="text-primary-500">
                        <UIcon name="material-symbols:download-for-offline-rounded" class="w-4 h-4" />
                        <span> 下载文件 </span>
                    </NuxtLink>
                    <div
                        class="text-primary-500 cursor-pointer"
                        @click="() => {
                            copy(createFontLink(pkgName, item.version!, asset.assets_name))
                            ElMessage.success('复制成功');
                        }"
                    >
                        <UIcon name="material-symbols:download-for-offline-rounded" class="w-4 h-4" />
                        <span> CSS 链接 </span>
                    </div>
                    <span class="text-gray-400">
                        {{ new Date(item.created_at).toLocaleString() }}
                    </span>
                </li>
            </ul>
        </li>
    </ul>
</template>
