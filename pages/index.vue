<script setup lang="ts">
import { type UnionConfig } from "~/composables/interface";
const user = useSupabaseUser();
const imported = useImportFromGithub();
const prebuild = usePreBuildFont();
const handlePrebuild = () => prebuild.fetch({ name: "lxgw/kose-font" });
const configs: UnionConfig[] = [
    {
        label: "Github 用户名",
        value: "name",
        type: "input",
        rules: [{ required: true }],
    },
    {
        label: "Github 仓库名",
        value: "repo",
        type: "input",
        rules: [{ required: true }],
    },
    {
        label: "字体中文名",
        value: "name_cn",
        type: "input",
        rules: [{ required: true }],
    },
];
const model = ref({});
const upload = (data: any) => {
    return imported.fetch(data).then(() => {
        model.value = {};
    });
};
</script>

<template>
    <div>{{ user?.email }}</div>
    <button @click="handlePrebuild">
        {{ imported.loading ? 1 : 0 }}
    </button>
    <magic-form :config="configs" v-model="model" :submit-action="upload" :title="'导入 Github 仓库字体'"></magic-form>
</template>
