<script setup lang="ts">
import type List from "#server-endpoint/api/packages/list.ts";
definePageMeta({
    layout: "packages",
});

const isSuper = useSuperMode();

const PackagesData = useAsyncJSON<List.Input, List.Output>(() => {
    return {
        url: isSuper.value ? "/api/packages/list-all" : "/api/packages/list",
    };
});
onMounted(() => {
    PackagesData.fetch({});
});
const getPreviewLink = (pkgName: string, style: any) => {
    let base = createFontLink(pkgName, style.version, style.file_name);
    return new URL("./preview.svg", base).toString();
};
</script>

<template>
    <ul v-if="PackagesData.data" class="flex flex-col my-8 max-w-4xl mx-auto divide-y border">
        <li class="w-full p-4 hover:bg-gray-50 transition-all" v-for="pack in PackagesData.data.data">
            <header class="flex justify-between items-baseline">
                <package-name :name_cn="pack.name_cn" :name="pack.name"></package-name>
                <div class="flex-1 flex justify-end gap-4">
                    <el-tag v-if="isSuper" :type="pack.is_published ? 'success' : 'danger'">
                        {{ pack.is_published ? "已发布" : "未发布" }}
                    </el-tag>
                    <NuxtLink v-if="pack.homepage" :to="pack.homepage">
                        <UIcon name="icon-park-outline:link" class="w-5 h-5 text-primary-500" />
                    </NuxtLink>
                </div>
            </header>
            <div class="text-gray-600 mb-3 flex flex-nowrap">
                <div class="flex-1 max-h-[3.8rem] line-clamp-3 text-sm overflow-hidden text-ellipsis">
                    {{ pack.description }}
                </div>
                <div class="flex-1 block place-content-center" v-if="pack.style">
                    <img
                        :src="getPreviewLink(pack.name, pack.style)"
                        :alt="'image preview for font ' + pack.name"
                        loading="lazy"
                    />
                </div>
            </div>
            <footer class="flex-col -m-2 justify-between text-sm">
                <div class="p-2 w-full">
                    <ul class="flex gap-2 flex-wrap">
                        <el-tag v-for="tag in pack.keywords" :key="tag" size="small">
                            {{ tag }}
                        </el-tag>
                    </ul>
                </div>
                <package-detail-row :pack="pack"></package-detail-row>
            </footer>
        </li>
    </ul>
</template>
