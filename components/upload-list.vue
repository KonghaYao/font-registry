<script setup lang="ts">
import { Dashboard } from "@uppy/vue";
import Uppy from "@uppy/core";
import XHR from "@uppy/xhr-upload";
import prettyBytes from "pretty-bytes";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";
import zh from "@uppy/locales/src/zh_CN";
const props = defineProps<{
    assetsList: any[];
    versionId: number;
}>();
const emits = defineEmits(["complete"]);

const saveAssetsAction = useAsyncJSON(async () => {
    return {
        url: "/api/version/edit-assets",
        method: "post",
    };
});

const uppy = new Uppy({
    locale: zh,
});
uppy.setOptions({
    restrictions: {
        maxFileSize: 1024 * 1024 * 50,
        minNumberOfFiles: 1,
        allowedFileTypes: [".ttf", ".otf"],
    },
});
uppy.use(XHR, { endpoint: "/api/oss/upload", withCredentials: true, shouldRetry: () => false });
uppy.on("complete", async (result) => {
    console.log("successful files:", result.successful);
    if (result.failed?.length) ElMessage.error(`上传失败 ${result.failed.length} 个`);
    if (result.successful?.length) {
        await saveAssetsAction.fetch(
            result.successful.map((item) => {
                const body = item.response!.body;
                return {
                    version_id: props.versionId,
                    assets_name: item.data.name,
                    size: body.fileSize,
                    download_url: body.fileUrl,
                };
            })
        );
        emits("complete");
    }
});

const deleteAsset = async (asset: any) => {
    await saveAssetsAction.fetch([{ ...asset, is_delete: true }]);
    emits("complete");
};
</script>

<template>
    <div class="flex flex-col gap-4 items-center upload-list" v-loading="saveAssetsAction.loading">
        <h3 class="text-center mt-2 mb-4 text-xl font-bold">字体文件列表</h3>
        <Dashboard :uppy="uppy" class="w-full h-64" />
        <ul class="p-4 flex flex-col w-full">
            <li class="flex py-1 gap-2 items-center hover:bg-gray-100" v-for="asset in assetsList" :key="asset.id">
                <span>
                    {{ asset.assets_name }}
                </span>
                <span class="flex-1"></span>
                <span class="text-gray-500 flex-none">
                    <!-- 文件 icon -->
                    <span class="inline-block w-20 text-right">
                        {{ prettyBytes(asset.size) }}
                    </span>
                </span>
                <el-button size="small" type="danger" @click="deleteAsset(asset)">
                    <UIcon name="icon-park-outline:close" class="w-4 h-4" />
                </el-button>
            </li>
        </ul>
    </div>
</template>

<style>
.upload-list .uppy-Dashboard-inner {
    width: 100% !important;
    height: 100% !important;
}
.upload-list .uppy-Dashboard,
.upload-list .uppy-Root {
    height: 100%;
}
</style>
