import { onMounted } from "vue";

/** @ts-ignore */
globalThis._dialog_store = globalThis._dialog_store || new Map<string, Ref<boolean>>();
/** @ts-ignore */
let h: Map<string, Ref<boolean>> = globalThis._dialog_store;
export const useMagicDialog = () => {
    const toggle = (id: string, flag?: boolean) => {
        const val = h.get(id);
        if (!val) {
            throw new Error(`${id} is not registered`);
        }
        if (typeof flag === "boolean") {
            val.value = flag;
        } else {
            val.value = !val.value;
        }
    };
    return {
        register(id: string, ref: Ref<boolean>) {
            onMounted(() => {
                h.set(id, ref);
            });
            onUnmounted(() => {
                h.delete(id);
            });
        },
        toggle,
    };
};
