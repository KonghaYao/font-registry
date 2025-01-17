export default defineEventHandler(async (event) => {
    const lastPath = event.path.split("/font-server/packages")[1];
    return sendRedirect(event, "https://ik.image.io/cnfont/packages/" + lastPath, 302);
});
