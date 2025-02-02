import type { FormItemRule } from "element-plus";

export const ValidURL: FormItemRule = {
    validator(_, value, cb) {
        if (!value) {
            return cb();
        }
        if (!/^https?:\/\//.test(value)) {
            return cb("请输入正确的 URL");
        }
        return cb();
    },
};

export const isRequired: FormItemRule = {
    required: true,
    message: "必填项",
    trigger: "blur",
};
