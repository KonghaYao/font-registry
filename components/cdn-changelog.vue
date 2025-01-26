<script setup lang="ts">
const { data } = await useFetch("/api/system/cdn-changelog");
</script>

<template>
    <el-card class="changelog">
        <template #header>
            <span> CDN 维护日志 </span>
        </template>
        <ul class="divide-y flex flex-col">
            <li class="my-2" v-for="item in data">
                <div class="flex justify-between my-2">
                    <span>
                        {{ item.user.login }}
                    </span>
                    <span>
                        {{ new Date(item.created_at).toLocaleString() }}
                    </span>
                </div>
                <MDC :value="item.body" tag="div"></MDC>
            </li>
        </ul>
    </el-card>
</template>
<style>
.changelog img {
    max-height: 200px;
}
</style>
