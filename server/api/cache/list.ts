export default defineCompose(authLayer, async (event) => {
    const store = useStorage("cache");
    return store.getKeys();
});
