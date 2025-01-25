<script setup lang="ts">
const cacheList = useAsyncJSON(async () => {
    return {
        url: "/api/cache/list",
    };
});
const deleteAction = useAsyncJSON(async () => {
    return {
        url: "/api/cache/clear",
        method: "post",
    };
});
const deleteCache = async (cacheKey?: string) => {
    await deleteAction.fetch({ name: cacheKey });
    await cacheList.fetch(null);
};
onMounted(() => {
    cacheList.fetch(null);
});
</script>
<template>
    <u-card>
        <div class="flex gap-4">
            <span> cache 缓存管理 </span>
            <u-button @click="cacheList.fetch(null)">刷新</u-button>
            <u-button @click="deleteCache()">删除全部</u-button>
        </div>
        <ul class="flex flex-col gap-2">
            <li v-for="cacheKey in cacheList.data" class="flex gap-4">
                <u-button @click="deleteCache(cacheKey)">删除</u-button>
                <div>
                    {{ cacheKey }}
                </div>
            </li>
        </ul>
    </u-card>
</template>
