<template>
    <div class="card table-search" v-if="searchFields.length">
        <el-form :mode="searchParams" :label-width="labelWidth" @submit.native.prevent="search">
            <el-row>
                <!-- 1、一个col一共24份，按8份划分成一组，传1个span就是一组，也就是8份;
                    2、span大于3会按3的倍数自动取余;
                    3、span传0会按1组来算
                -->
                <el-col
                    v-for="(column, index) in searchFields"
                    :key="column.prop"
                    :index="index"
                    :span="((column.search?.span || 1) % 3 || 3) * 8"
                >
                    <el-form-item>
                        <!-- label -->
                        <template #label>
                            <el-space :size="4">
                                {{ column.search?.label ?? column.label }}
                                <el-tooltip
                                    v-if="column.search?.tooltip"
                                    effect="dark"
                                    :content="column.search?.tooltip"
                                    placement="top"
                                >
                                    <i class="iconfont icon-yiwen"></i>
                                </el-tooltip>
                            </el-space>
                        </template>
                        <!-- content -->
                        <component
                            :is="column.search?.render ?? 'el-' + column.search?.type"
                            v-model.trim="searchParams[column.search?.prop ?? column.prop]"
                            :data="column.search?.type === 'tree-select' ? column.options : []"
                            :options="
                                ['cascader', 'select-v2'].includes(column.search.type)
                                    ? column.options
                                    : []
                            "
                            clearable
                            :placeholder="`${column.search?.type === 'input' ? '请输入' : '请选择'}${column.label}`"
                        ></component>
                    </el-form-item>
                </el-col>
                <!-- 操作栏 -->
                <el-col :span="operateSpan">
                    <div class="operation">
                        <el-button type="primary" icon="Search" @click.native="search">
                            搜索
                        </el-button>
                        <el-button icon="Delete" @click.native="reset"> 重置 </el-button>
                    </div>
                </el-col>
            </el-row>
        </el-form>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps({
    // 搜索表单
    searchFields: {
        type: Array as any,
        default: []
    },
    // 搜索栏 label 宽度
    labelWidth: {
        type: Number,
        default: 100
    }
})

// 搜索栏默认参数
const defaultSearchParams: any = ref({})
let item: any
for (item of props.searchFields) {
    if (item.search.defaultValue) {
        defaultSearchParams.value[item.search?.prop ?? item.prop] = item.search?.defaultValue
    }
}

// 将默认参数赋给搜索参数
const searchParams: any = ref(Object.assign({}, defaultSearchParams.value))

// 定义 emit 方法
const emit = defineEmits<{
    search: [{ searchParams: object }]
    reset: []
}>()

// 搜索
const search = () => {
    emit('search', { searchParams })
}

// 重置
const reset = () => {
    searchParams.value = defaultSearchParams.value
    emit('reset')
}

// 让搜索重置按钮始终保持在最右边
const operateSpan = computed(() => {
    const colSpanSum = props.searchFields.reduce((pre: any, cur: any) => {
        if (props.searchFields.length === 1) {
            return pre
        }
        pre += cur.search.span || 1
        return pre
    }, props.searchFields[0].search?.span || 1)
    return (3 - (colSpanSum % 3)) * 8
})
</script>

<style lang="scss" scoped>
.table-search {
    padding: 18px 18px 0;
    margin-bottom: 5px;
    .operation {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        margin-bottom: 18px;
    }
}
</style>
