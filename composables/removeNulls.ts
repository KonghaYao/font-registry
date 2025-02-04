export function removeNulls<T>(obj: T): T {
    // 如果是数组，遍历每个元素
    if (Array.isArray(obj)) {
        /**@ts-ignore */
        return obj.map(removeNulls).filter((item) => item !== null);
    }
    // 如果不是对象或者为空，直接返回
    if (typeof obj !== "object" || obj === null) {
        return obj;
    }
    // 如果是对象，遍历其属性
    const result = {};
    Object.keys(obj).forEach((key) => {
        /**@ts-ignore */
        const value = removeNulls(obj[key]);
        // 如果值不为 null，则保留该属性
        if (value !== null) {
            /**@ts-ignore */
            result[key] = value;
        }
    });
    /**@ts-ignore */
    return result;
}
