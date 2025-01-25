export const createFontLink = (pkgName: string, versionName: string, fileName: string) => {
    const file_folder = ("/packages/" + pkgName + "/" + versionName + "/" + fileName).replaceAll(".", "_");
    return `/api/font-source/${file_folder}/result.css`;
};
