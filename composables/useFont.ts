export const createFontLink = (pkgName: string, versionName: string, fileName: string) => {
    const file_folder = ("/packages/" + pkgName + "/" + versionName + "/" + fileName).replaceAll(".", "_");
    return `${import.meta.env.VITE_CDN_ROOT || ""}${file_folder}/result.css`.replace(/\/+/g, "/");
};
