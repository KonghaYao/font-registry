export const createFontLink = (pkgName: string, versionName: string, fileName: string) => {
    const file_folder = ("/packages/" + pkgName + "/" + versionName + "/" + fileName).replaceAll(".", "_");
    return `${process.env.CDN_ROOT}${file_folder}/result.css`;
};
