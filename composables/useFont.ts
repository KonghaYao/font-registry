export const createFontLink = (pkgName: string, versionName: string, fileName: string) => {
    const file_folder = ("/packages/" + pkgName + "/" + versionName + "/" + fileName).replaceAll(".", "_");
    return `https://ik.imagekit.io/cnfont${file_folder}/result.css`;
};
