<template>
    <el-form style="margin: 0 40px" ref="formRef" :model="_formData" :label-width="labelWidth">
        <el-form-item
            v-for="(item, index) in formFields"
            :key="index"
            :label="item.label"
            :prop="item.prop"
            :rules="item.rules"
        >
            <!-- form-label -->
            <template #label>
                <el-space :size="4">
                    {{ item.label }}
                    <el-tooltip
                        v-if="item.tooltip"
                        effect="dark"
                        :content="item.tooltip || ''"
                        placement="top"
                    >
                        <i class="iconfont icon-yiwen"></i>
                    </el-tooltip>
                    :
                </el-space>
            </template>
            <!-- form-cell -->
            <template #default>
                <slot :name="item.prop" :formData="_formData[item.prop]" :formItem="item">
                    <component
                        v-if="item.type"
                        :is="`el-${item.type}`"
                        v-model.trim="_formData[item.prop]"
                        :disabled="item.disabled"
                        :size="size"
                        :data="item.type === 'tree-select' ? item.options : []"
                        :options="['cascader', 'select-v2'].includes(item.type) ? item.options : []"
                        clearable
                        :placeholder="
                            item.placeholder ??
                            `${item.type === 'input' ? '请输入' : '请选择'}${item.label}`
                        "
                    >
                        <!-- cascader -->
                        <template v-if="item.type === 'cascader'" #default="{ data }">
                            <span>{{ data.label }}</span>
                        </template>
                        <!-- select -->
                        <template v-if="item.type === 'select'">
                            <component
                                :is="`el-option`"
                                v-for="(col, index) in item.options"
                                :key="index"
                                :label="col.label"
                                :value="col.value"
                            ></component>
                        </template>
                    </component>
                    <span v-else>{{ item.prop }}</span>
                </slot>
            </template>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import type { FormInstance } from 'element-plus'

const props = defineProps({
    // form 表单 column
    formFields: {
        type: Array as any,
        default: []
    },
    // form 表单 column
    formData: {
        type: Object,
        default: () => ({})
    },
    // 表单组件 type
    type: {
        type: String,
        default: ''
    },
    // 禁用表单组件
    disabledForm: {
        type: Boolean,
        default: false
    },
    // 表单 label 宽度
    labelWidth: {
        type: String,
        default: 'auto'
    },
    // 表单组件 size
    size: {
        type: String,
        default: 'default'
    }
})

// form 表单实例
const formRef = ref<FormInstance>()

// 定义 emit 方法
const emit = defineEmits<{
    getFormData: [{ formData: object; formValidate: any }]
}>()

// 表单里的参数
const curFormData: any = computed(() => props.formData)

watch(
    curFormData,
    () => {
        setFormData()
    },
    { deep: true }
)

// 表单默认参数
const defaultFormData: any = reactive({})
// 组合后的表单参数
const _formData: any = ref({})
const setFormData = () => {
    // 赋默认值
    for (let i of props.formFields) {
        if (i.defaultValue) {
            defaultFormData[i.prop] = i.defaultValue
        }
    }
    // 将全部参数赋给表单
    _formData.value = Object.assign(defaultFormData, curFormData.value)
    emit('getFormData', { formData: _formData, formValidate: formRef })
}
</script>

<style lang="scss" scoped></style>
