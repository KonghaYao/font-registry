export default defineCompose(authRunner, async (event) => {
    const store = useStorage("cache");
    return store.getKeys();
});
