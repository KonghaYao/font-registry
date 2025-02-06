/** 开启超级模式，并可以获取是否开启了超级模式 */
export const useSuperMode = () => {
    const isSuper = ref(false);
    useLocalStorage("super-mode", isSuper);

    const keys = useMagicKeys();
    const Key = keys["Alt+Ctrl+A"];
    watch(Key, (v) => {
        if (v) {
            isSuper.value = !isSuper.value;
            ElMessage.success(isSuper.value ? "超级模式已开启" : "超级模式已关闭");
        }
    });
    return isSuper;
};
