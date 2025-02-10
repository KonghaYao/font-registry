import { Client } from "minio";

export const s3Client = new Client({
    region: useRuntimeConfig().NUXT_S3_REGION,
    endPoint: useRuntimeConfig().NUXT_S3_ENDPOINT,
    useSSL: true,
    accessKey: useRuntimeConfig().NUXT_S3_AK,
    secretKey: useRuntimeConfig().NUXT_S3_SK,
    pathStyle: false,
});
