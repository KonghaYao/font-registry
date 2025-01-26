import { useAfterResponse } from "./compose";
import { VoidError } from "./Errors";
export const cacheLayer =
    (cacheConfig: { getKey?: () => string } = {}): ComposeEventHandler =>
    async (event) => {
        const store = useStorage("cache");
        const key = cacheConfig.getKey?.() ?? event.node.req.url!;
        if (!key) throw new VoidError("Cache Key is void");
        if (await store.hasItem(key)) {
            return store.getItemRaw(key);
        }
        useAfterResponse(event, async (result) => {
            if (result instanceof Blob) {
                return store.setItemRaw(key, new Uint8Array(await result.arrayBuffer()));
            }
            return store.setItemRaw(key, result);
        });
    };
