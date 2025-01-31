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
    let base = new URL(createFontLink(pkgName, style.version, style.file_name), location.href);
    return new URL("./preview.svg", base).toString();
};
</script>

<template>
    <ul v-if="PackagesData.data" class="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
        <u-card class="w-full" v-for="pack in PackagesData.data.data">
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
                <div class="flex-1 line-clamp-3">
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
                <div class="p-2 w-full md:w-1/2 lg:w-1/3">
                    <ul class="flex gap-2">
                        <el-tag v-for="tag in pack.keywords" :key="tag" size="small">
                            {{ tag }}
                        </el-tag>
                    </ul>
                </div>
                <package-detail-row :pack="pack"></package-detail-row>
            </footer>
        </u-card>
    </ul>
</template>
