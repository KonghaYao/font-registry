<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { type UnionConfig } from "../composables/interface";
import { computed } from "vue";
const props = defineProps<{
    config: UnionConfig[];
    modelValue: any;
    title?: string;
    submitAction: (input: any) => Promise<any>;
    message?: string;
}>();

const submit = useAsyncAction(props.submitAction);
const showValue = (value: string, config: UnionConfig) => {
    if (config.display) {
        return config.display(value);
    }
    return value;
};
const maxLabelWidth = computed(() => {
    return (
        props.config.reduce((pre, cur) => {
            return Math.max(pre, cur.label.length);
        }, 0) * 12
    );
});
const formEl = ref<FormInstance>();
const submitForm = async () => {
    if (!formEl.value) return;
    await formEl.value.validate((valid, fields) => {
        if (valid) {
            return submit.fetch(props.modelValue);
        } else {
            ElMessage.warning("请填写完整信息");
        }
    });
};
</script>

<template>
    <el-form ref="formEl" :model="modelValue" :label-width="maxLabelWidth" class="px-4 py-2">
        <h3 class="text-center mt-2 mb-4 text-xl font-bold" v-if="title">{{ title }}</h3>
        <el-form-item
            v-for="item in config"
            :key="item.value"
            :prop="item.value"
            :label="item.label"
            :rules="item.rules"
        >
            <el-input v-if="item.type === 'input'" v-model="modelValue[item.value]" :type="item.type" />
            <span v-else>
                {{ showValue(modelValue[item.value], item) }}
            </span>
        </el-form-item>
        <el-form-item class="flex gap-4 mt-3">
            <el-button type="primary" :loading="submit.loading" @click="() => submitForm()"> 提交 </el-button>
            <slot name="button"></slot>
            <el-alert v-if="message && submit.loading" :title="message" type="warning" />
        </el-form-item>
    </el-form>
</template>
