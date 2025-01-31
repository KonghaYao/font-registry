<template>
    <div class="py-8 flex flex-col gap-4 max-w-xl mx-auto">
        <el-card class="w-full p-4">
            <template #header>
                <div class="font-bold text-2xl">用户信息</div>
            </template>
            <el-row>
                <el-col :span="24" v-for="item in config" :key="item.name" class="mb-4">
                    <div class="flex justify-between">
                        <div class="font-bold">{{ item.name }}</div>
                        <div>{{ item.value }}</div>
                    </div>
                </el-col>
            </el-row>
        </el-card>
        <el-card class="w-full p-4">
            <template #header>
                <div class="flex justify-between">
                    <div class="font-bold text-2xl">Packages</div>
                    <el-button @click="useMagicDialog().toggle('import-from-github-dialog')">
                        从 github 导入
                    </el-button>
                </div>
            </template>
            <el-row>
                <el-col :span="24" v-for="item in packages.data" :key="item.id" class="mb-4">
                    <a :href="'/packages/' + item.name" class="flex gap-4 justify-between">
                        <span class="font-bold">{{ item.name_cn }}</span>
                        <span>{{ item.name }}</span>
                    </a>
                    <el-tag :type="item.is_published ? 'success' : 'danger'">{{
                        item.is_published ? "已发布" : "未发布"
                    }}</el-tag>
                    <el-button
                        size="small"
                        @click="
                            injectAndOpenImport({
                                name: item.name.split('/')[0],
                                repo: item.name.split('/')[1],
                                name_cn: item.name_cn,
                            })
                        "
                    >
                        重新导入
                    </el-button>
                </el-col>
            </el-row>
        </el-card>
        <import-from-github-dialog ref="importDialog" />
    </div>
</template>

<script setup lang="ts">
const importDialog = ref();
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
const isSuper = useSuperMode();
const client = useSupabaseClient();
const packages = useAsyncAction(async () => {
    let builder = client.from("packages").select("name_cn,name,id,is_published");

    if (!isSuper.value) builder = builder.eq("user_id", user.value?.id!);
    const { data, error } = await builder;
    if (error) throw error;
    return data;
});

onMounted(() => {
    console.log(user);
    packages.fetch(null);
});
const injectAndOpenImport = (data: any) => {
    importDialog.value.model = data;
    useMagicDialog().toggle("import-from-github-dialog");
};
</script>
