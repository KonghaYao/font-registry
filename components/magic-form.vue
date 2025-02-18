<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { type BaseConfig, type UnionConfig } from "../composables/interface";
import { cloneDeep } from "lodash";
import { computed } from "vue";
const props = defineProps<{
    config: UnionConfig[];
    modelValue: any;
    title?: string;
    subtitle?: string;
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
            const snapshot = cloneDeep(props.modelValue);
            return submit.fetch(snapshot);
        } else {
            ElMessage.warning("请填写完整信息");
        }
    });
};
const isType = <T extends BaseConfig, D = T["type"]>(value: T, type: D[]) => {
    /** @ts-ignore */
    return type.includes(value.type!);
};

const runAsync = useAsyncAction<() => Promise<any>, any, any>(async (fn) => {
    await fn();
});
const commonDisable = (config: BaseConfig) =>
    runAsync.loading || config.disabled?.(props.modelValue[config.value], props.modelValue);
</script>

<template>
    <el-form
        ref="formEl"
        label-position="top"
        :model="modelValue"
        :label-width="maxLabelWidth"
        class="magic-form px-4 py-2"
    >
        <h3 class="text-center mt-2 mb-4 text-xl font-bold" v-if="title">{{ title }}</h3>
        <h4 class="text-center mt-2 mb-4 text-gray-500" v-if="subtitle">{{ subtitle }}</h4>
        <el-row :gutter="16">
            <el-col :span="item.span ?? 24" v-for="item in config" :key="item.value">
                <el-form-item :prop="item.value" :label="item.label" :rules="item.rules">
                    <template #label="{ label }">
                        <span>{{ label }}</span>

                        <el-button-group class="float-right">
                            <el-button
                                v-for="(button, index) in item.buttons"
                                :disabled="commonDisable(item)"
                                size="small"
                                @click="runAsync.fetch(async () => button.click?.(modelValue[item.value], modelValue))"
                            >
                                {{ button.label ?? "确认" }}
                            </el-button>
                        </el-button-group>
                    </template>
                    <el-input
                        v-if="isType(item, ['input', 'textarea'] as const)"
                        v-model="modelValue[item.value]"
                        :type="item.type"
                        :show-word-limit="!!item.maxlength"
                        :maxlength="item.maxlength"
                        :placeholder="item.placeholder ?? '请输入' + item.label"
                        @change="item.change?.(modelValue[item.value], modelValue)"
                        :clearable="true"
                        :disabled="commonDisable(item)"
                    >
                    </el-input>
                    <el-select
                        v-else-if="isType(item, ['select','tags'] as const)"
                        v-model="modelValue[item.value]"
                        :placeholder="item.placeholder ?? '请选择' + item.label"
                        :multiple="isType(item, ['tags'] as const)"
                        @change="item.change?.(modelValue[item.value], modelValue)"
                        :filterable="true"
                        :clearable="true"
                        :allow-create="isType(item, ['tags'] as const)"
                        :disabled="commonDisable(item)"
                    >
                        <el-option
                            v-for="option in item.options"
                            :key="option.value"
                            :label="option.label"
                            :value="option.value"
                        />
                    </el-select>
                    <el-switch v-else-if="isType(item, ['switch'])" v-model="modelValue[item.value]"> </el-switch>
                    <slot
                        v-else-if="isType(item, ['custom'])"
                        v-bind="{
                            modelValue,
                            config: item,
                            disabled: commonDisable(item),
                        }"
                        name="custom"
                    ></slot>
                    <span v-else>
                        {{ showValue(modelValue[item.value], item) }}
                    </span>
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item class="flex gap-4">
            <el-button type="primary" :loading="submit.loading" @click="() => submitForm()"> 提交 </el-button>
            <slot name="button" v-bind="{ submit }"></slot>
        </el-form-item>
        <el-alert v-if="message && submit.loading" :title="message" type="warning" />
    </el-form>
</template>

<style>
svg.md-editor-icon {
    width: 1.5rem;
    height: 1.5rem;
}
.magic-form .el-form-item__label {
    width: 100%;
}
</style>
