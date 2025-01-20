import JSZip from "jszip";

export class ZIPPath {
    static cache = new Map<string, JSZip>();
    constructor(public url: string) {}

    get result(): JSZip | undefined | null {
        return ZIPPath.cache.get(this.url);
    }
    set result(value: JSZip) {
        ZIPPath.cache.set(this.url, value);
    }
    async cacheFetch() {
        if (this.result) return this.result;
        const res = await fetch(this.url);
        const blob = await res.arrayBuffer();
        this.result = await new JSZip().loadAsync(new Uint8Array(blob));
        setTimeout(() => {
            this.clearCache();
        }, 24 * 60 * 60 * 1000);
    }
    clearCache() {
        ZIPPath.cache.delete(this.url);
    }
    getPaths() {
        const all: string[] = [];
        this.result?.forEach((path, file) => all.push(path));
        return all;
    }
    getFile(innerPath: string) {
        return this.result?.file(innerPath)?.async("uint8array");
    }
}
