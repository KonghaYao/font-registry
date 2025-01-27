<script setup lang="ts">
import { useMagicDialog } from "~/composables/useMagicDialog";
import type Import from "#server-endpoint/api/import-from-github.ts";
import type Prebuild from "#server-endpoint/api/prebuild-font.ts";

const prebuild = useAsyncJSON<Prebuild.Input, Prebuild.Output>(() => {
    return { url: "/api/prebuild-font", method: "post" };
});
const imported = useAsyncSSEJSON<Import.Input, Import.Output, string>(
    (data) => {
        return {
            url: "/api/import-from-github",
            method: "post",
            body: data,
        };
    },
    {
        onSuccess: (data, input) => {
            ElMessage.success(`${input.name}/${input.repo} 导入成功`);
        },
        onError(err, input) {
            console.error(err);
            ElMessage.error(`${err.message} ${input.name}/${input.repo} 导入失败`);
        },
    }
);

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
        return prebuild.fetch({ name: `${data.name}/${data.repo}`, force: true });
    });
};
const magic = useMagicDialog();
</script>
<template>
    <magic-dialog id="import-from-github-dialog" :title="'导入 Github 仓库字体'" min-width="500px">
        <magic-form :config="configs" v-model="model" :submit-action="upload" :message="imported.message">
            <template #button>
                <el-button @click="magic.toggle('import-from-github-dialog')">关闭</el-button>
            </template>
        </magic-form>
    </magic-dialog>
</template>
