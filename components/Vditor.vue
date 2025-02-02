<template>
    <div ref="vditorContainer"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from "vue";
import "vditor/dist/index.css";
// 定义 props 和 emit
const props = defineProps({
    modelValue: {
        type: String,
        default: "",
    },
});

const emit = defineEmits(["update:modelValue"]);

// 使用 ref 获取 DOM 元素
const vditorContainer = ref(null);
let vditorInstance = null;

// 在组件挂载后初始化 Vditor
onMounted(async () => {
    // 确保只在客户端执行
    const { default: Vditor } = await import("vditor");
    vditorInstance = new Vditor(vditorContainer.value, {
        height: 600,
        toolbarConfig: { pin: true },
        cache: { enable: false },
        after: () => {
            vditorInstance.setValue(props.modelValue);
        },
        input: (value) => {
            emit("update:modelValue", value);
        },
    });
});

// 监听 prop 的变化，并更新 Vditor 的内容
watch(
    () => props.modelValue,
    (newValue) => {
        if (vditorInstance && newValue !== vditorInstance.getValue()) {
            vditorInstance.setValue(newValue);
        }
    }
);

// 在组件销毁前清理 Vditor 实例
onBeforeUnmount(() => {
    if (vditorInstance) {
        vditorInstance.destroy();
        vditorInstance = null;
    }
});
</script>

<style scoped>
/* 可以在这里添加一些样式 */
</style>
