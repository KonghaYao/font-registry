import { ComposeEventHandler, useAfterResponse } from "./compose";
import { VoidError } from "./Errors";
import { hash } from "ohash";
import { H3Event } from "h3";
export const cacheLayer =
    (
        cacheConfig: {
            before?: ComposeEventHandler;
            getKey?: () => string;
        } = {}
    ): ComposeEventHandler =>
    async (event) => {
        const store = useStorage("cache");
        let key = cacheConfig.getKey?.() ?? event.node.req.url!;
        if (!key) throw new VoidError("Cache Key is void");
        key = encodeKey(key);
        if (cacheConfig.before) await cacheConfig.before(event);
        if (await store.hasItem(key)) {
            const data = await store.getItemRaw(key);
            setResponseHeader(event, "x-server-cache", "hit");
            setResponseHeader(event, "etag", "W/" + hash(key));
            if (data instanceof Uint8Array || data instanceof ArrayBuffer) {
                return new Blob([data]);
            } else {
                return data;
            }
        }
        useAfterResponse(event, async (result) => {
            setResponseHeader(event, "x-server-cache", "miss");
            setResponseHeader(event, "etag", "W/" + hash(key));
            if (result instanceof Blob) {
                return store.setItemRaw(key, new Uint8Array(await result.arrayBuffer()));
            }
            return store.setItemRaw(key, result);
        });
    };
/** 数据成功返回时，产生清除缓存的副作用 */
export const clearCacheLayer =
    <T, D>(getKeys: (event: H3Event, result: D) => string[]): ComposeEventHandler<T, D> =>
    /** @ts-ignore */
    async (event) => {
        useAfterResponse<D>(event, async (result) => {
            const store = useStorage("cache");
            const keys = getKeys(event, result);
            for (const key of keys) {
                await store.removeItem(key);
            }
            console.log("清理缓存 \n", keys.join("\n  "));
        });
    };

export const encodeKey = (str?: string) => {
    if (!str) return "undefined_key";
    return decodeURIComponent(str).replace(/[\?\/=\&:]/g, "_");
};
