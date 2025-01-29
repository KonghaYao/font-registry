import { hasPermissionLayer, hasRoleLayer } from "~/server/utils/auth";

export default defineCompose(authLayer, hasRoleLayer(["admin"]), async (event) => {
    const store = useStorage("cache");
    return store.getKeys();
});
