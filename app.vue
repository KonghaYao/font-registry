<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
<style>
body {
    --el-color-primary: #2ca6b8;
    --el-color-primary-light-3: #33bacf;
    --el-color-primary-light-5: rgb(159.5, 206.5, 255);
    --el-color-primary-light-7: rgb(197.7, 225.9, 255);
    --el-color-primary-light-8: rgb(216.8, 235.6, 255);
    --el-color-primary-light-9: rgb(235.9, 245.3, 255);
    --el-color-primary-dark-2: rgb(51.2, 126.4, 204);

    --el-color-success: #67c23a;
    --el-color-success-light-3: rgb(148.6, 212.3, 117.1);
    --el-color-success-light-5: rgb(179, 224.5, 156.5);
    --el-color-success-light-7: rgb(209.4, 236.7, 195.9);
    --el-color-success-light-8: rgb(224.6, 242.8, 215.6);
    --el-color-success-light-9: rgb(239.8, 248.9, 235.3);
    --el-color-success-dark-2: rgb(82.4, 155.2, 46.4);
    --el-color-warning: #e6a23c;
    --el-color-warning-light-3: rgb(237.5, 189.9, 118.5);
    --el-color-warning-light-5: rgb(242.5, 208.5, 157.5);
    --el-color-warning-light-7: rgb(247.5, 227.1, 196.5);
    --el-color-warning-light-8: rgb(250, 236.4, 216);
    --el-color-warning-light-9: rgb(252.5, 245.7, 235.5);
    --el-color-warning-dark-2: rgb(184, 129.6, 48);
    --el-color-danger: #f56c6c;
    --el-color-danger-light-3: rgb(248, 152.1, 152.1);
    --el-color-danger-light-5: rgb(250, 181.5, 181.5);
    --el-color-danger-light-7: rgb(252, 210.9, 210.9);
    --el-color-danger-light-8: rgb(253, 225.6, 225.6);
    --el-color-danger-light-9: rgb(254, 240.3, 240.3);
    --el-color-danger-dark-2: rgb(196, 86.4, 86.4);
    --el-color-error: #f56c6c;
    --el-color-error-light-3: rgb(248, 152.1, 152.1);
    --el-color-error-light-5: rgb(250, 181.5, 181.5);
    --el-color-error-light-7: rgb(252, 210.9, 210.9);
    --el-color-error-light-8: rgb(253, 225.6, 225.6);
    --el-color-error-light-9: rgb(254, 240.3, 240.3);
    --el-color-error-dark-2: rgb(196, 86.4, 86.4);
    --el-color-info: #909399;
    --el-color-info-light-3: rgb(177.3, 179.4, 183.6);
    --el-color-info-light-5: rgb(199.5, 201, 204);
    --el-color-info-light-7: rgb(221.7, 222.6, 224.4);
    --el-color-info-light-8: rgb(232.8, 233.4, 234.6);
    --el-color-info-light-9: rgb(243.9, 244.2, 244.8);
    --el-color-info-dark-2: rgb(115.2, 117.6, 122.4);
    --el-bg-color: #ffffff;
    --el-bg-color-page: #f2f3f5;
    --el-bg-color-overlay: #ffffff;
    --el-text-color-primary: #303133;
    --el-text-color-regular: #606266;
    --el-text-color-secondary: #909399;
    --el-text-color-placeholder: #a8abb2;
    --el-text-color-disabled: #c0c4cc;
    --el-border-color: #dcdfe6;
    --el-border-color-light: #e4e7ed;
    --el-border-color-lighter: #ebeef5;
    --el-border-color-extra-light: #f2f6fc;
    --el-border-color-dark: #d4d7de;
    --el-border-color-darker: #cdd0d6;
    --el-fill-color: #f0f2f5;
    --el-fill-color-light: #f5f7fa;
    --el-fill-color-lighter: #fafafa;
    --el-fill-color-extra-light: #fafcff;
    --el-fill-color-dark: #ebedf0;
    --el-fill-color-darker: #e6e8eb;
    --el-fill-color-blank: #ffffff;
    --el-border-radius-base: 8px;
}
.el-card {
    --el-card-border-radius: 8px !important;
    @apply bg-white;
}
.el-dialog {
    border: 1px solid #e1e1e1;
}
.el-form-item__label {
    padding: 0 1rem 0 0;
}

.el-form-item__error {
    left: 0.3rem !important;
    top: -0.5rem !important;
    background: white;
    padding: 0px 0.2rem;
}
.h-page {
    height: calc(100vh - 98px);
}
@media (min-width: 1024px) {
    .h-page {
        height: calc(100vh - 65px);
    }
}
.page-enter-active,
.page-leave-active {
    transition: opacity 1.5s;
}
.page-enter,
.page-leave-active {
    opacity: 0;
}
* {
    @apply transition-all;
}
</style>
