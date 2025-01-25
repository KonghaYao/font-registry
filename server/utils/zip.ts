import JSZip from "jszip";

export class ZIPPath {
    static cache = useStorage<ArrayBuffer>("zip-cache");
    constructor(public url: string) {}

    getResult(): Promise<Uint8Array | undefined | null> {
        return ZIPPath.cache.getItemRaw(this.url);
    }
    setResult(value: Uint8Array) {
        ZIPPath.cache.setItemRaw(this.url, value);
    }
    zip: JSZip | undefined;
    async cacheFetch() {
        const cache = await this.getResult();
        if (cache) return this.getResult();
        const res = await fetch(this.url);
        const blob = new Uint8Array(await res.arrayBuffer());
        this.setResult(blob);
        this.zip = await new JSZip().loadAsync(blob);
    }
    getPaths() {
        const all: string[] = [];
        this.zip?.forEach((path, file) => all.push(path));
        return all;
    }
    getFile(innerPath: string) {
        return this.zip?.file(innerPath)?.async("uint8array");
    }
    getFileSize(innerPath: string): number {
        /** @ts-ignore */
        return this.zip?.file(innerPath)?._data?.uncompressedSize;
    }
}
