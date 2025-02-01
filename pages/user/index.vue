<template>
    <div class="my-8 flex flex-col max-w-xl mx-auto border divide-y">
        <div class="w-full">
            <div class="hover:bg-gray-50 font-bold text-2xl p-4 pt-8 border-b">用户信息</div>
            <ul class="flex flex-col divide-y">
                <li :span="24" v-for="item in config" :key="item.name" class="hover:bg-gray-50 px-4 py-2">
                    <div class="flex justify-between w-full">
                        <div class="font-bold text-gray-700">{{ item.name }}</div>
                        <div>{{ item.value }}</div>
                    </div>
                </li>
            </ul>
        </div>
        <div class="w-full">
            <div class="hover:bg-gray-50 flex justify-between p-4 pt-8 border-b">
                <div class="font-bold text-2xl">Packages</div>
                <el-button @click="useMagicDialog().toggle('import-from-github-dialog')"> 从 github 导入 </el-button>
            </div>
            <ul class="flex flex-col divide-y">
                <li :span="24" v-for="item in packages.data" :key="item.id" class="hover:bg-gray-50 flex px-4 py-2">
                    <a :href="'/packages/' + item.name" class="flex-1 text-gray-700">
                        <span class="font-bold">{{ item.name_cn }}</span>
                    </a>

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
                    <el-button
                        :loading="prebuild.loading"
                        size="small"
                        @click="
                            rebuildImport({
                                name: item.name,
                                force: true,
                            })
                        "
                    >
                        重新构建
                    </el-button>
                    <el-tag :type="item.is_published ? 'success' : 'danger'">{{
                        item.is_published ? "已发布" : "未发布"
                    }}</el-tag>
                </li>
            </ul>
        </div>
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
    packages.fetch(null);
});
const injectAndOpenImport = (data: any) => {
    importDialog.value.model = data;
    useMagicDialog().toggle("import-from-github-dialog");
};
const prebuild = useAsyncJSON<{ name: string }, never>(
    () => ({
        url: "/api/prebuild-font",
        method: "post",
    }),
    {
        onSuccess(data, input) {
            ElMessage.success(`${input.name} 重新构建成功`);
        },
    }
);
const rebuildImport = (data: any) => {
    prebuild.fetch(data);
};
</script>
