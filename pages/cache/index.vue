<script setup lang="ts">
import type List from "#server-endpoint/api/cache/list.ts";
import type Clear from "#server-endpoint/api/cache/clear.ts";
const cacheList = useAsyncJSON<List.Input, List.Output>(async () => {
    return {
        url: "/api/cache/list",
    };
});
const deleteAction = useAsyncJSON<Clear.Input, Clear.Output>(async () => {
    return {
        url: "/api/cache/clear",
        method: "post",
    };
});
const deleteCache = async (cacheKey?: string | string[]) => {
    await deleteAction.fetch(Array.isArray(cacheKey) ? { names: cacheKey } : { name: cacheKey });
    await cacheList.fetch(null);
};
onMounted(() => {
    cacheList.fetch(null);
});
const filterText = ref("");
const filteredList = computed(() => {
    if (!filterText.value) return cacheList.data!;
    return cacheList.data?.filter((item) => item.includes(filterText.value)) || [];
});
</script>
<template>
    <div class="flex flex-col gap-4 h-page">
        <page-header>
            <div class="font-bold flex-none">系统缓存管理</div>
            <template #actions>
                <el-input size="small" placeholder="搜索 key 值" class="pr-4" v-model="filterText"></el-input>
                <el-button size="small" :loading="cacheList.loading" @click="cacheList.fetch(null)">刷新</el-button>
                <el-button
                    size="small"
                    type="danger"
                    :loading="deleteAction.loading"
                    @click="deleteCache(filteredList)"
                >
                    删除指定
                </el-button>
                <el-button size="small" type="danger" :loading="deleteAction.loading" @click="deleteCache()">
                    删除全部
                </el-button>
            </template>
        </page-header>

        <div class="flex-1 overflow-y-scroll">
            <ul class="flex flex-col gap-2">
                <li
                    v-for="cacheKey in filteredList"
                    class="flex gap-4 items-center transition-all hover:bg-primary-50 px-4"
                >
                    <div class="line-clamp-1 h-fit text-nowrap flex-1">
                        {{ cacheKey }}
                    </div>
                    <el-button size="small" :loading="deleteAction.loading" @click="deleteCache(cacheKey)"
                        >删除
                    </el-button>
                </li>
            </ul>
        </div>
    </div>
</template>
