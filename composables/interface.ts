import type { Arrayable } from "@vueuse/core";
import type { FormItemRule } from "element-plus";
export type UnionConfig = InputConfig | SelectConfig | CustomConfig;
export interface InputConfig extends BaseConfig {
    type: "input" | "textarea";
    maxlength?: number;
    buttonClick?: (value: string, model: any) => Promise<void> | void;
}
export interface SelectConfig extends BaseConfig {
    type: "select" | "tags";
    multiple?: boolean;
    options?: { value: string; label: string }[];
}
export interface CustomConfig extends BaseConfig {
    type: "custom";
    key: string;
}

export interface BaseConfig {
    label: string;
    value: string;
    type?: string;
    placeholder?: string;
    rules?: Array<FormItemRule>;
    span?: number;
    change?: (value: string, formValue: any) => void;
    /** 纯文本展示转化 */
    display?: (value: string) => string;
}
