<script setup lang="ts">
import { ValidURL } from "../composables/useRules";
import Vditor from "./Vditor.vue";
import Upsert from "#server-endpoint/api/packages/upsert.ts";

const props = defineProps<{
    id?: number;
}>();

onMounted(() => {
    if (typeof props.id === "number") {
        upsertAction.fetch({
            id: props.id,
            dryRun: true,
        } as any);
    }
});

const isEditMode = computed(() => {
    /** @ts-ignore */
    return model.value.id;
});
const configs: UnionConfig[] = [
    {
        label: "中文名称",
        value: "name_cn",
        type: "input",
        maxlength: 20,
        placeholder: "字体的中文名称",
        rules: [isRequired],
        span: 12,
    },
    {
        label: "名称 ID",
        value: "name",
        type: "input",
        placeholder: "作者名/字体名, 如 KonghaYao/cn-font-split",
        maxlength: 20,
        rules: [isRequired, IDValidate],
        span: 12,
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
        label: "官方地址",
        value: "homepage",
        type: "input",
        placeholder: "字体的官方发布地址",
        rules: [ValidURL],
        span: 12,
    },
    {
        label: "授权",
        value: "license",
        type: "select",
        placeholder: "可以填入开源授权证书，可不填或者 Other",
        span: 12,
        options: License.map((i) => ({
            value: i,
            label: i,
        })),
        rules: [],
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
        value: "import_article",
        type: "input",
        placeholder: "可以输入一个网站，然后进行导入，这样就不用自己写了",
        buttonClick: async (value: string, model: any) => {
            if (!value || !value.startsWith("http")) {
                ElMessage.warning("请输入一个网站地址");
                return;
            }
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
                .then((res) => {
                    if (res.ok) return res.text();
                    throw new Error("请求失败");
                })
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
const model = ref({
    // id: 69,
    // // 测试数据
    // name_cn: "测试字体",
    // name: "test/info-font",
    // description: "这是一个测试字体",
    // homepage: "https://nuxt.com/modules/icon",
    // license: "Other",
    // keywords: ["测试", "字体"],
    // import_article: "https://nuxt.com/modules/icon",
});

const upsertAction = useAsyncJSON<Upsert.Input, Upsert.Output>(
    () => {
        return {
            url: "/api/packages/upsert",
            method: "post",
        };
    },
    {
        onSuccess(data, input) {
            ElMessage.success("更新数据完成");
            model.value = data.data as any;
        },
    }
);

const submit = async (data: any) => {
    await upsertAction.fetch(data);
};
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    ElMessage.warning("暂时不支持上传图片");

    callback([]);
};
</script>
<template>
    <magic-form
        :config="configs"
        v-model="model"
        :submit-action="submit"
        :title="isEditMode ? '编辑字体包' : '新增字体包'"
    >
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
