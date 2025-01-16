import { serverSupabaseUser } from "#supabase/server";
import { octokit } from "./github-endpoint";
import z from "zod";
import { serverSupabaseClient } from "#supabase/server";
import { RestEndpointMethodTypes } from "@octokit/rest";
import { Database } from "~/types/database.types";

export default defineEventHandler(async (event) => {
    const lastPath = event.path.split("/font-server/packages")[1];
    return sendRedirect(event, "https://ik.image.io/cnfont/packages/" + lastPath, 302);
});
