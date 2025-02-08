<script setup lang="ts">
import Vditor from "./Vditor.vue";
import Upsert from "#server-endpoint/api/version/upsert.ts";
import { cloneDeep } from "lodash";

const props = defineProps<{
    pkgId: number;
    id?: number;
}>();
const refresh = () => {
    if (typeof props.pkgId === "number") {
        upsertAction.fetch({
            package_id: props.pkgId,
            id: props.id,
            dryRun: true,
        } as any);
    }
};
onMounted(refresh);

const isEditMode = computed(() => {
    /** @ts-ignore */
    return model.value.id;
});
const configs: UnionConfig[] = [
    {
        label: "版本号",
        value: "version",
        type: "input",
        maxlength: 20,
        placeholder: "请使用语义化版本号，如 1.2.1",
        rules: [isRequired],
        span: 12,
    },
    {
        // 是否最新版本
        label: "是否最新版本",
        value: "isLatest",
        type: "switch",
        rules: [isRequired],
        span: 12,
    },
    {
        label: "版本描述信息",
        value: "description",
        type: "custom",
        key: "markdown",
        rules: [isRequired],
    },
];
const defaultModel = {
    isLatest: true,
};
const model = ref(cloneDeep(defaultModel));
const pkgData = ref<any>({});

const upsertAction = useAsyncJSON<Upsert.Input, Upsert.Output>(
    () => {
        return {
            url: "/api/version/upsert",
            method: "post",
        };
    },
    {
        onSuccess(data, input) {
            ElMessage.success("更新数据完成");
            model.value = data.data.version || (cloneDeep(defaultModel) as any);
            pkgData.value = data.data.package;
            console.log(model.value);
        },
    }
);

const submit = async (data: any) => {
    await upsertAction.fetch({ ...data, package_id: props.pkgId, id: props.id });
    if (!props.id) {
        useRouter().push(`/edit/version/${props.pkgId}/${model.value.id}`);
    }
};
const onUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    ElMessage.warning("暂时不支持上传图片");

    callback([]);
};
</script>
<template>
    <magic-form
        v-loading="upsertAction.loading"
        :config="configs"
        v-model="model"
        :submit-action="submit"
        :title="(isEditMode ? '编辑版本' : '新增版本') + ` ${pkgData.name_cn || ''}`"
        :subtitle="isEditMode ? '' : '请发布您的版本，然后可以上传您的字体文件'"
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
    <upload-list
        v-loading="upsertAction.loading"
        v-if="props.id"
        :versionId="props.id!"
        :assets-list="model.assets ?? []"
        @complete="refresh"
    >
    </upload-list>
</template>

<style>
svg.md-editor-icon {
    width: 1.5rem;
    height: 1.5rem;
}
</style>
