<template>
    <ps-dialog
        :dialogHeader="dialogHeader"
        :loading="loading"
        :openDialog="openDialog"
        :open="open"
        @confirm="confirm"
        @close="close"
    >
        <el-transfer
            filterable
            filter-placeholder="请输入公司名称"
            v-model="companySelected"
            :data="resData"
            :titles="['选择下属公司', '已经添加到下属公司']"
            :props="{ label: 'company_name', key: 'company_id' }"
        >
        </el-transfer>
    </ps-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import { getCompanyPrepareSonList, addCompanySons } from '@/api/companyManagement'

const props = defineProps({
    // 打开弹窗
    openDialog: {
        type: Boolean,
        default: false
    },
    // 弹窗标题
    dialogHeader: {
        type: String,
        default: ''
    },
    // 当前行数据
    rowData: {
        type: Object,
        default: () => {}
    }
})

// 定义 emit 方法
const emit = defineEmits<{
    confirm: [] // 关闭弹窗
    close: [] // 关闭弹窗
}>()

const userStore = useUserStore()

const loading = ref(false) // 加载样式
const resData = ref([]) // 请求返回的数据
const companySelected = ref([]) // 已有被选择的数据

// 弹窗打开时触发
const open = () => {
    // 重置参数
    reset()
    // 请求数据
    loading.value = true
    const params = {
        access_token: userStore.token,
        company_id: userStore.userInfo.company_id
    }
    getCompanyPrepareSonList(params)
        .then((res: any) => {
            resData.value = res.prepare_son_list || []
            companySelected.value = res.selected || []
        })
        .finally(() => {
            setTimeout(() => {
                loading.value = false
            }, 100)
        })
}

// 添加数据
const confirm = () => {
    loading.value = true
    const params = {
        access_token: userStore.token,
        father_id: props.rowData.company_id,
        sons_id: JSON.stringify(companySelected.value)
    }
    addCompanySons(params)
        .then(() => {
            ElMessage.success('添加成功')
            emit('confirm')
        })
        .finally(() => {
            setTimeout(() => {
                loading.value = false
            }, 100)
        })
}

// 关闭弹窗
const close = () => {
    emit('close')
}

// 重置参数
const reset = () => {
    loading.value = false
    resData.value = []
    companySelected.value = []
}
</script>

<style scoped></style>
