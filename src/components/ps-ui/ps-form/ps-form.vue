<template>
    <el-form ref="refForm" :model="fieldList" :rules="rules" :label-width="labelWidth">
        <el-form-item
            v-for="(item, index) in fieldList"
            :key="index"
            :label="item.label"
            :prop="item.key"
        >
            <component :is="'el-' + item.type" :disabled="disabled" :size="size"></component>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
const { fieldList, rules, labelWidth, size } = defineProps({
    fieldList: {
        type: Object,
        default: () => {}
    },
    rules: {
        type: Object,
        default: []
    },
    labelWidth: {
        type: String,
        default: 'auto'
    },
    size: {
        type: String,
        default: 'default'
    },
    type: {
        type: String,
        default: ''
    },
    disabled: {
        type: Boolean,
        default: false
    }
})
</script>

<style lang="scss" scoped></style>
