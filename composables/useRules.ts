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

/** 验证 package ID */
export const IDValidate: FormItemRule = {
    validator(_, value, cb) {
        if (!value) {
            return cb();
        }
        if (!isValidGithubRepo(value)) {
            return cb("ID 格式为 username/repo, 英文或数字");
        }
        return cb();
    },
};
const usernameRegex = /^(?![-_])(?!.*[-_]$)[a-zA-Z0-9-_]{1,39}$/;

function isValidUsername(username: string) {
    return usernameRegex.test(username);
}

const repoNameRegex = /^[a-z][a-z0-9_-]*$/;

function isValidRepoName(repoName: string) {
    return repoNameRegex.test(repoName);
}
export function isValidGithubRepo(fullName: string) {
    const parts = fullName.split("/");
    if (parts.length !== 2) return false; // 必须正好有两个部分

    const [username, repo] = parts;
    return isValidUsername(username) && isValidRepoName(repo);
}
