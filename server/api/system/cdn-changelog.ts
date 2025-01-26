export default defineCachedCompose(async () => {
    const { data } = await octokit.issues.listComments({
        owner: "konghayao",
        repo: "chinese-free-web-font-storage",
        issue_number: 64,
        per_page: 100,
    });
    return data
        .filter((i) => {
            return i.author_association === "OWNER";
        })
        .reverse();
})({
    maxAge: 60 * 60 * 24,
});
