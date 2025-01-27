import md5 from "md5";

export const getUserAvatar = () => {
    const user = useSupabaseUser();
    return (
        user.value?.user_metadata.avatar_url ||
        "https://cn.cravatar.com/avatar/" + md5(user.value?.email || "") + "s=64"
    );
};
export const getFullName = () => {
    const user = useSupabaseUser();
    return user.value?.user_metadata.full_name || user.value?.user_metadata.name || user.value?.email;
};
