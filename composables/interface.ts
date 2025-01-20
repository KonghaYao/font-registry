import type { Arrayable } from "@vueuse/core";
import type { FormItemRule } from "element-plus";
export interface UnionConfig {
    label: string;
    value: string;
    type?: "input";
    /** 纯文本展示转化 */
    display?: (value: string) => string;
    rules?: Arrayable<FormItemRule>;
}
