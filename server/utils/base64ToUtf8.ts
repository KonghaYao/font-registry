export function base64ToUtf8(base64String?: string | null) {
    if (!base64String) return base64String;
    if (typeof Buffer === "function") {
        // Node.js 环境
        return Buffer.from(base64String, "base64").toString("utf8");
    } else if (typeof atob === "function" && typeof TextDecoder === "function") {
        // 浏览器环境
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return new TextDecoder("utf-8").decode(bytes);
    } else {
        throw new Error("Unsupported environment");
    }
}
