<template>
    <ps-dialog
        :dialogHeader="dialogHeader"
        :loading="loading"
        :openDialog="openDialog"
        :open="open"
        :dialogInnerStyle="dialogInnerStyle"
        @confirm="confirm"
        @close="close"
    >
        <ps-form :formFields="formFields" :formData="formData" @getFormData="getFormData"></ps-form>
    </ps-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import { insertCompany, setCompanyInfo } from '@/api/companyManagement'

const props = defineProps({
    // 打开弹窗
    openDialog: {
        type: Boolean,
        default: false
    },
    // 弹窗标题
    dialogHeader: {
        type: String,
        default: '新建'
    },
    // 弹窗类型
    mode: {
        type: String,
        default: 'add'
    },
    // form 表单 column
    formFields: {
        type: Array,
        default: []
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

const dialogInnerStyle = reactive({
    height: '300px'
}) // 弹窗高度
const loading = ref(false) // 加载样式
const resData = ref([]) // 请求返回的数据
const companySelected = ref([]) // 已有被选择的数据
const formData = ref({}) // 表单数据

// 弹窗打开时触发
const open = () => {
    // 根据mode设值弹窗高度
    dialogInnerStyle.height = props.mode === 'add' ? '280px' : '330px'
    // 重置参数
    reset()
    // 请求数据
    loading.value = true
    formData.value = computed(() => props.rowData).value
    setTimeout(() => {
        loading.value = false
    }, 100)
}

// 最新数据
const curFormData: any = ref({})
// form 表单实例
const formValidate: any = ref({})
const getFormData = (params: any) => {
    curFormData.value = params.formData.value
    formValidate.value = params.formValidate.value
}

// 添加数据
const confirm = () => {
    // form 表单验证是否通过
    formValidate.value.validate((valid: any) => {
        if (!valid) return
        loading.value = true
        if (props.mode === 'add') {
            // 新建
            const params = {
                access_token: userStore.token,
                company_id: userStore.userInfo.company_id,
                tel: '',
                ...curFormData.value
            }
            insertCompany(params)
                .then(() => {
                    ElMessage.success('添加成功')
                    emit('confirm')
                })
                .finally(() => {
                    setTimeout(() => {
                        loading.value = false
                    }, 100)
                })
        } else {
            // 修改
            const params = {
                access_token: userStore.token,
                account_old: props.rowData.account,
                account: curFormData.value.account,
                company_full_name: curFormData.value.company_full_name,
                company_name: curFormData.value.company_name,
                tel: curFormData.value.tel,
                manage_node: curFormData.value.manage_node,
                manage_company: curFormData.value.manage_company
            }
            setCompanyInfo(params)
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
    formData.value = {}
}
</script>

<style scoped></style>
