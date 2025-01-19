export default defineEventHandler(async (event) => {
    const lastPath = event.path.split("/font/packages")[1];
    return sendRedirect(event, process.env.CDN_ROOT + "/packages/" + lastPath, 302);
});
