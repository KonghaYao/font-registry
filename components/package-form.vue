<script setup lang="ts">
import { ValidURL } from "../composables/useRules";
import Vditor from "./Vditor.vue";
const configs: UnionConfig[] = [
    {
        label: "中文名称",
        value: "name_cn",
        type: "input",
        maxlength: 20,
        placeholder: "字体的中文名称",
        rules: [isRequired],
    },
    {
        label: "名称 ID",
        value: "name",
        type: "input",
        placeholder: "作者名/字体名, 如 KonghaYao/cn-font-split",
        maxlength: 20,
        rules: [isRequired],
    },
    {
        label: "描述信息",
        value: "description",
        type: "textarea",
        placeholder: "字体的描述信息",
        maxlength: 200,
        rules: [isRequired],
    },
    {
        label: "官网",
        value: "homepage",
        type: "input",
        rules: [ValidURL],
    },
    {
        label: "授权",
        value: "License",
        type: "select",
        placeholder: "可以填入开源授权证书，可不填或者 Other",
        options: License.map((i) => ({
            value: i,
            label: i,
        })),
        rules: [isRequired],
    },
    {
        label: "关键词",
        value: "keywords",
        type: "tags",
        placeholder: "便于字友搜索得到的关键字",
        rules: [isRequired],
    },
    {
        label: "从网站导入文章",
        value: "input",
        type: "input",
        placeholder: "可以输入一个网站，然后进行导入，这样就不用自己写了",
        buttonClick: async (value: string, model: any) => {
            ElMessage.info("导入中。。。");
            return fetch("/api/system/website-to-md", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    url: value,
                }),
            })
                .then((res) => res.text())
                .then((res) => {
                    model.readme = res;
                    ElMessage.success("导入成功");
                })
                .catch((e) => {
                    console.error(e);
                    ElMessage.error("导入失败");
                });
        },
    },
    {
        label: "主页详细文章",
        value: "readme",
        type: "custom",
        key: "markdown",
        rules: [isRequired],
    },
];
const model = ref({});
const submit = async () => {};
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    ElMessage.warning("暂时不支持上传图片");

    callback([]);
};
</script>
<template>
    <magic-form :config="configs" v-model="model" :submit-action="submit">
        <template #custom="{ modelValue, config }">
            <div v-if="config.key === 'markdown'" class="w-full overflow-hidden">
                <ClientOnly>
                    <Vditor
                        v-model="modelValue[config.value]"
                        @onUploadImg="onUploadImg"
                        :no-katex="true"
                        :no-mermaid="true"
                    />
                </ClientOnly>
            </div>
        </template>
    </magic-form>
</template>

<style>
svg.md-editor-icon {
    width: 1.5rem;
    height: 1.5rem;
}
</style>
