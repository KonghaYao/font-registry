<script setup lang="ts">
import type List from "#server-endpoint/api/packages/list.ts";
definePageMeta({
    layout: "packages",
});
const PackagesData = useAsyncJSON<List.Input, List.Output>(() => {
    return {
        url: "/api/packages/list",
    };
});
onMounted(() => {
    PackagesData.fetch({});
});
</script>

<template>
    <ul v-if="PackagesData.data" class="flex flex-col gap-8 py-8 max-w-4xl mx-auto">
        <u-card class="w-full" v-for="pack in PackagesData.data.data">
            <header class="flex justify-between items-baseline">
                <package-name :name_cn="pack.name_cn" :name="pack.name"></package-name>
                <div class="flex-1 flex justify-end gap-4">
                    <NuxtLink v-if="pack.from === 'github_api'" :to="'https://github.com/' + pack.name">
                        <u-icon name="ant-design:github-filled" class="w-5 h-5 text-black"></u-icon>
                    </NuxtLink>
                    <NuxtLink v-if="pack.homepage" :to="pack.homepage">
                        <UIcon name="icon-park-outline:link" class="w-5 h-5 text-primary-500" />
                    </NuxtLink>
                </div>
            </header>
            <div class="text-gray-600 mb-3">
                {{ pack.description }}
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
