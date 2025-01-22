<script setup lang="ts">
import type { DialogProps } from "element-plus";
import { useMagicDialog } from "../composables/useMagicDialog";
const props = defineProps<
    {
        initShow?: boolean;
        id: string;
    } & Partial<DialogProps>
>();
const show = ref(props.initShow ?? false);
const magic = useMagicDialog();
magic.register(props.id, show);
</script>
<template>
    <el-dialog v-bind="props" v-model="show">
        <slot></slot>
    </el-dialog>
</template>
