const h = new Map<string, Ref<boolean>>();
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
            h.set(id, ref);
            onUnmounted(() => {
                h.delete(id);
            });
        },
        toggle,
    };
};
