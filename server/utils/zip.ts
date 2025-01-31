export class ZIPPath {
    constructor(public url: string) {}
    getPaths() {
        const url = new URL("/list", useRuntimeConfig().NUXT_ZIP_SERVER);
        url.searchParams.set("url", encodeURIComponent(this.url));
        return fetch(url).then<
            {
                name: string;
                size: number;
            }[]
        >((res) => res.json());
    }
    getFile(innerPath: string) {
        const url = new URL("/get", useRuntimeConfig().NUXT_ZIP_SERVER);
        url.searchParams.set("url", encodeURIComponent(this.url));
        url.searchParams.set("path", encodeURIComponent(innerPath));
        return fetch(url)
            .then((res) => res.arrayBuffer())
            .then((res) => new Uint8Array(res));
    }
}
