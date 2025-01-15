<script setup lang="ts">
import type { Database } from '~/types/database.types';
const state = ref("");
const client = useSupabaseClient<Database>();
const querySearch = (queryString: string, cb: any) => {
    client
        .from("packages")
        .select("*")
        .or(`name.ilike.%${queryString}%,description.ilike.%${queryString}%`)
        .limit(20)
        .then((res) => {
            cb(res.data);
        });
};
const handleSelect = (item: Record<string, any>) => {
    navigateTo(`/packages/${item.name}`);
};
</script>

<template>
    <div class="bg-gray-50 border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800 border-b">
        <el-autocomplete v-model="state" :fetch-suggestions="querySearch" placeholder="搜索字体" @select="handleSelect">
            <template #default="{ item }">
                <div class="value">
                    <b>
                        {{ item.name }}
                    </b>
                    {{ item.description }}
                </div>
            </template>
        </el-autocomplete>
    </div>
</template>
