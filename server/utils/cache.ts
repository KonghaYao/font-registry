import { ComposeEventHandler, useAfterResponse } from "./compose";
import { VoidError } from "./Errors";
import { hash } from "ohash";

export const cacheLayer =
    (
        cacheConfig: {
            before?: ComposeEventHandler;
            getKey?: () => string;
        } = {}
    ): ComposeEventHandler =>
    async (event) => {
        const store = useStorage("cache");
        let key = cacheConfig.getKey?.() ?? event.node.req.originalUrl!;
        if (!key) throw new VoidError("Cache Key is void");
        key = key.replace("?", "_");
        if (cacheConfig.before) await cacheConfig.before(event);
        if (await store.hasItem(key)) {
            const data = await store.getItemRaw(key);
            if (data instanceof Uint8Array) {
                setResponseHeader(event, "etag", "W/" + hash(key));
                return new Blob([data]);
            } else {
                return data;
            }
        }
        useAfterResponse(event, async (result) => {
            if (result instanceof Blob) {
                return store.setItemRaw(key, new Uint8Array(await result.arrayBuffer()));
            }
            return store.setItemRaw(key, result);
        });
    };
