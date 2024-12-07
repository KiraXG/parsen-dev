<template>
    <el-dialog
        v-model="_dialogVisible"
        class="ps-dialog"
        draggable
        overflow
        destroy-on-close
        align-center
        append-to-body
        :close-on-click-modal="false"
        :width="width"
        @open="open"
        @close="closeDialog"
    >
        <!-- 标题 -->
        <template #header>
            <slot name="dialogHeader">
                <div class="dialogHeader">
                    {{ dialogHeader }}
                </div>
            </slot>
        </template>
        <!-- 内容 -->
        <div
            class="dialog-inner"
            :style="dialogInnerStyle"
            v-loading="loading"
            element-loading-text="正在加载数据，请稍等..."
        >
            <slot></slot>
        </div>
        <!-- 底部 -->
        <template #footer>
            <slot name="dialogFooter">
                <div>
                    <el-button @click="closeDialog">{{ isEdit ? '取消' : '关闭' }}</el-button>
                    <el-button
                        :loading="loading"
                        :disabled="loading"
                        type="primary"
                        @click="confirmDialog"
                        v-if="isShowConfirm"
                        >{{ isView ? '确认' : '提交' }}</el-button
                    >
                </div>
            </slot>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps({
    // 弹窗宽度
    width: {
        type: Number,
        default: 700
    },
    // 弹窗内部高度
    dialogInnerStyle: {
        type: Object,
        default: () => ({
            height: '350px'
        })
    },
    // 弹窗标题
    dialogHeader: {
        type: String,
        default: '详情'
    },
    // 打开弹窗时的回调
    open: {
        type: Function as any,
        default: () => ({})
    },
    // 显示弹窗
    openDialog: {
        type: Boolean,
        default: false
    },
    // 加载样式
    loading: {
        type: Boolean,
        default: false
    },
    // 是否显示确认按钮
    isShowConfirm: {
        type: Boolean,
        default: true
    },
    // 是否是编辑模式
    isEdit: {
        type: Boolean,
        default: true
    },
    // 是否是只读模式
    isView: {
        type: Boolean,
        default: false
    }
})

// 定义 emit 方法
const emit = defineEmits<{
    confirm: []
    close: []
}>()

// 打开弹窗
const _openDialog = computed(() => props.openDialog)
const _dialogVisible = ref(false)

watch(_openDialog, (val) => {
    _dialogVisible.value = val
})

// 确认
const confirmDialog = () => {
    emit('confirm')
}

// 关闭
const closeDialog = () => {
    emit('close')
}
</script>

<style lang="scss" scoped>
.dialogHeader {
    font-size: 20px;
    padding: 5px 0 10px 5px;
}

.dialog-inner {
    width: 100%;
    height: 100%;
}
</style>
