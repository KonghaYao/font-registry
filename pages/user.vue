<template>
    <div class="container mx-auto p-4">
        <h1 class="text-3xl font-bold mb-4 border-b pb-4">用户信息</h1>
        <el-row>
            <el-col
                :span="24"
                v-for="item in config"
                :key="item.name"
                class="mb-4"
            >
                <div class="leading-2 font-bold">{{ item.name }}</div>
                <div>{{ item.value }}</div>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();

const config = computed(() => [
    {
        name: "邮箱",
        value: user.value?.email ?? "未登录",
    },
    {
        name: "注册时间",
        value:
            user.value?.created_at &&
            new Date(user.value?.created_at).toLocaleString(),
    },
]);
</script>

<style scoped>
.container {
    max-width: 600px;
}
</style>
