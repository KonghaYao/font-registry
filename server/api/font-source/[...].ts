// 下载 zip 内的文件
export default defineCachedCompose(async (event) => {
    const extra = event.path.split("/font-source/")[1];
    return fetch(process.env.OSS_ROOT + "/" + extra);
})({
    maxAge: 24 * 60 * 60,
});
