<script setup lang="ts"></script>

<template>
    <div class="flex py-4 px-8 gap-8 border-b">
        <div class="flex-1">
            <div class="page-header-title-icon">
                <slot name="icon"></slot>
            </div>
            <div class="flex gap-8 items-center">
                <slot></slot>
            </div>
        </div>
        <div class="flex items-center">
            <slot name="actions"></slot>
        </div>
    </div>
</template>
