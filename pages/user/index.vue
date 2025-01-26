<template>
    <div class="py-8 flex flex-col gap-4 max-w-xl mx-auto">
        <u-card class="w-full p-4">
            <el-row class="mb-4">
                <div class="font-bold text-2xl">用户信息</div>
            </el-row>
            <el-row>
                <el-col :span="24" v-for="item in config" :key="item.name" class="mb-4">
                    <div class="flex justify-between">
                        <div class="font-bold">{{ item.name }}</div>
                        <div>{{ item.value }}</div>
                    </div>
                </el-col>
            </el-row>
        </u-card>
        <u-card class="w-full p-4">
            <el-row class="mb-4">
                <div class="font-bold text-2xl">Packages</div>
            </el-row>
            <el-row>
                <el-col :span="24" v-for="item in packages.data" :key="item.id" class="mb-4">
                    <a :href="'/packages/' + item.name" class="flex gap-4">
                        <span class="font-bold">{{ item.name_cn }}</span>
                        <span>{{ item.name }}</span>
                    </a>
                </el-col>
            </el-row>
        </u-card>
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
        value: user.value?.created_at && new Date(user.value?.created_at).toLocaleString(),
    },
]);

const client = useSupabaseClient();
const packages = useAsyncAction(async () => {
    const { data, error } = await client.from("packages").select("name_cn,name").eq("user_id", user.value?.id!);
    if (error) throw error;
    return data;
});
onMounted(() => {
    packages.fetch(null);
});
</script>
