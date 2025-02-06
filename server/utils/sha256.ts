export async function sha256(message: string | Uint8Array) {
    let data: Uint8Array;
    if (typeof message === "string") {
        const encoder = new TextEncoder();

        // 将输入字符串转换为 UTF-8 编码的 Uint8Array
        data = encoder.encode(message);
    } else {
        data = message;
    }

    // 使用 crypto.subtle 模块来计算 SHA-256 哈希值
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);

    // 将 ArrayBuffer 转换为十六进制字符串表示形式
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
}
