<script setup lang="ts">
import { debounce } from "lodash";
import type List from "#server-endpoint/api/packages/list.ts";
const state = ref("");
const querySearch = debounce((queryString: string, cb: any) => {
    fetch("/api/packages/list?query=" + queryString)
        .then((res) => res.json())
        .then((res) => {
            cb(res.data as List.Output);
        });
}, 300);
const handleSelect = (item: Record<string, any>) => {
    navigateTo(`/packages/${item.name}`);
};
</script>

<template>
    <div
        class="bg-gray-50 border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800 border-b sticky left-0 top-24 lg:top-16 z-40"
    >
        <el-autocomplete v-model="state" :fetch-suggestions="querySearch" placeholder="搜索字体" @select="handleSelect">
            <template #default="{ item }">
                <el-space spacer=" | " class="value">
                    <b>
                        {{ item.name_cn }}
                    </b>
                    <b>
                        {{ item.name }}
                    </b>
                    {{ item.description }}
                </el-space>
            </template>
        </el-autocomplete>
    </div>
</template>
