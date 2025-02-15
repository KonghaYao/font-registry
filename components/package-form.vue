<script setup lang="ts">
import { ValidURL } from "../composables/useRules";
import Vditor from "./Vditor.vue";
import Upsert from "#server-endpoint/api/packages/upsert.ts";
import { useAIJSON } from "~/composables/useAI";

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
        maxlength: 40,
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
        buttons: [
            {
                label: "从文章生成",
                async click(value: string) {
                    const readme = model.value.readme ?? "";
                    // 字数限制
                    if (readme.length <= 200) {
                        ElMessage.warning("请输入超过 200 字的主页详细文章");
                        return;
                    }

                    ElMessage.info("AI 思考中。。。");
                    model.value.description = "";
                    return useAI(
                        "article/summary",
                        {
                            article: readme,
                        },
                        (info) => {
                            const content = info.choices[0]?.delta?.content;
                            if (content) model.value.description += content;
                        }
                    );
                },
            },
        ],
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
        buttons: [
            {
                label: "从文章中总结",
                click: () => {
                    const readme = model.value.readme ?? "";
                    // 字数限制
                    if (readme.length <= 200) {
                        ElMessage.warning("请输入超过 200 字的主页详细文章");
                        return;
                    }
                    return useAIJSON(
                        "article/create-tag",
                        {
                            article: readme,
                            tagLength: 10,
                        },
                        (info) => {
                            console.log(info);
                            /** @ts-ignore */
                            const content = info.choices[0]?.message?.content;
                            if (content) {
                                const c = JSON.parse(content);
                                model.value.keywords = c.tags || c.content;
                            }
                        }
                    );
                },
            },
        ],
    },
    {
        label: "从网站导入文章",
        value: "import_article",
        type: "input",
        placeholder: "可以输入一个网站，然后进行导入，这样就不用自己写了",
        buttons: [
            {
                label: "导入",
                async click(value: string, model: any) {
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
        ],
    },
    {
        label: "主页详细文章",
        value: "readme",
        type: "custom",
        key: "markdown",
        rules: [isRequired],
    },
];
const model = ref<any>({
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
const versionDropDown = computed(() => {
    return [
        model.value.versions?.map((i) => {
            return {
                label: i.version,
                click() {
                    useRouter().push(`/edit/version/${props.id}/${i.id}`);
                },
            };
        }),
    ];
});
</script>
<template>
    <magic-form
        v-loading="upsertAction.loading"
        :config="configs"
        v-model="model"
        :submit-action="submit"
        :title="isEditMode ? '编辑字体包' : '新增字体包'"
        :subtitle="isEditMode ? '' : '新增字体后，可以发布版本并上传您的字体文件'"
    >
        <template #custom="{ modelValue, config, disabled }">
            <div v-if="config.key === 'markdown'" class="w-full overflow-hidden">
                <ClientOnly>
                    <Vditor
                        :disabled="disabled"
                        v-model="modelValue[config.value]"
                        @onUploadImg="onUploadImg"
                        :no-katex="true"
                        :no-mermaid="true"
                    />
                </ClientOnly>
            </div>
        </template>
        <template #button>
            <el-button v-if="model.id" tag="a" :href="`/edit/version/${model.id}`">新增版本 </el-button>
            <UDropdown
                class="ml-4"
                v-if="versionDropDown[0]"
                :items="versionDropDown"
                :popper="{ placement: 'top-start' }"
            >
                <el-button>修改版本</el-button>
            </UDropdown>
        </template>
    </magic-form>
</template>

<style>
svg.md-editor-icon {
    width: 1.5rem;
    height: 1.5rem;
}
</style>
