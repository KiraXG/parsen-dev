<template>
    <ps-dialog
        :dialogHeader="dialogHeader"
        :loading="loading"
        :openDialog="openDialog"
        :open="open"
        :dialogInnerStyle="dialogInnerStyle"
        :isShowConfirm="mode === 'offsetAndZero' ? false : true"
        @confirm="confirm"
        @close="close"
    >
        <div v-if="mode === 'offsetAndZero'">
            <div>
                <div style="margin-bottom: 10px">
                    <el-tag>请注意在发送命令后, 再唤醒仪表, 命令才会传给仪表执行</el-tag>
                </div>
                <el-input v-model="offset" style="width: 350px; margin-right: 10px"></el-input>
                <el-popconfirm
                    confirm-button-text="是"
                    cancel-button-text="否"
                    icon="InfoFilled"
                    icon-color="#626AEF"
                    title="确定要调整仪表读数吗？"
                    placement="top"
                    @confirm="submitOffset"
                >
                    <template #reference>
                        <el-button type="danger" icon="Odometer">调整仪表（对表）</el-button>
                    </template>
                </el-popconfirm>
            </div>
            <el-divider></el-divider>
            <div style="margin-bottom: 10px">
                <el-tag>请注意在发送调零命令后, 再唤醒仪表, 命令才会传给仪表执行</el-tag>
            </div>
            <el-popconfirm
                confirm-button-text="是"
                cancel-button-text="否"
                icon="InfoFilled"
                icon-color="#626AEF"
                title="确定要调零吗？"
                placement="top"
                @confirm="submitZero"
            >
                <template #reference>
                    <el-button type="danger" icon="WarningFilled">调零</el-button>
                </template>
            </el-popconfirm>
        </div>
        <ps-form
            v-else
            :formFields="formFields"
            :formData="formData"
            @getFormData="getFormData"
        ></ps-form>
        <div v-if="mode === 'edit'">
            <div v-for="info in curLineDatas" style="margin: 0 40px">
                <el-divider></el-divider>
                <div>
                    <div>最新数据: {{ info.displayValue }} {{ info.unitName }}</div>
                    <div style="margin-bottom: 10px">
                        <el-switch
                            v-model="info.setDesc"
                            active-text="自定义"
                            inactive-text="默认"
                        ></el-switch>
                        <el-input
                            v-model="info.lineDesc"
                            style="width: 170px"
                            :disabled="!info.setDesc"
                        >
                            <template #prepend>通道名称</template>
                        </el-input>
                        <el-input v-model="info.pointPos" style="width: 130px">
                            <template #prepend>小数位</template>
                        </el-input>
                        <el-select
                            v-if="info.isPressureUnit"
                            v-model="info.displayUnit"
                            placeholder="kPa(默认)"
                            style="width: 130px"
                        >
                            <el-option
                                v-for="item in displayUnits"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                            >
                            </el-option>
                        </el-select>
                    </div>
                    <div style="margin-bottom: 10px">
                        <el-switch
                            v-model="info.is_cus_unit"
                            active-text="自定义"
                            inactive-text="默认"
                        ></el-switch>

                        <el-input
                            v-model="info.cus_unit"
                            style="width: 250px"
                            :disabled="!info.is_cus_unit"
                        >
                            <template #prepend>自定义单位</template>
                        </el-input>
                    </div>
                    <div style="margin-bottom: 10px; display: flex; flex-direction: row">
                        <el-tag type="warning" style="margin: 5px">一级报警</el-tag>
                        <div style="display: flex; flex-direction: column; margin: 5px">
                            <el-input
                                v-model="info.lo_alarm_1"
                                style="width: 200px"
                                :disabled="!info.l1_open"
                            >
                                <template #prepend>&ensp;下限&ensp;</template>
                            </el-input>
                            <el-input
                                v-model="info.lo_recover_1"
                                style="width: 200px"
                                :disabled="!info.l1_open"
                            >
                                <template #prepend>下恢复</template>
                            </el-input>
                        </div>
                        <el-switch v-model="info.l1_open"></el-switch>
                        <div style="display: flex; flex-direction: column; margin: 5px">
                            <el-input
                                v-model="info.hi_alarm_1"
                                style="width: 200px"
                                :disabled="!info.h1_open"
                            >
                                <template #prepend>&ensp;上限&ensp;</template>
                            </el-input>
                            <el-input
                                v-model="info.hi_recover_1"
                                style="width: 200px"
                                :disabled="!info.h1_open"
                            >
                                <template #prepend>上恢复</template>
                            </el-input>
                        </div>
                        <el-switch v-model="info.h1_open"></el-switch>
                    </div>

                    <div style="margin-bottom: 10px; display: flex; flex-direction: row">
                        <el-tag type="danger" style="margin: 5px">二级报警</el-tag>
                        <div style="display: flex; flex-direction: column; margin: 5px">
                            <el-input
                                v-model="info.lo_alarm_2"
                                style="width: 200px"
                                :disabled="!info.l2_open"
                            >
                                <template #prepend>下下限</template>
                            </el-input>
                            <el-input
                                v-model="info.lo_recover_2"
                                style="width: 200px"
                                :disabled="!info.l2_open"
                            >
                                <template #prepend>下恢复</template>
                            </el-input>
                        </div>
                        <el-switch v-model="info.l2_open"></el-switch>
                        <div style="display: flex; flex-direction: column; margin: 5px">
                            <el-input
                                v-model="info.hi_alarm_2"
                                style="width: 200px"
                                :disabled="!info.h2_open"
                            >
                                <template #prepend>上上限</template>
                            </el-input>
                            <el-input
                                v-model="info.hi_recover_2"
                                style="width: 200px"
                                :disabled="!info.h2_open"
                            >
                                <template #prepend>上恢复</template>
                            </el-input>
                        </div>
                        <el-switch v-model="info.h2_open"></el-switch>
                    </div>
                </div>
            </div>
        </div>
    </ps-dialog>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import useUserStore from '@/store/modules/user'
import {
    insertNode,
    insertSim,
    updateNodeFullParams,
    setOffset,
    setZero,
    displaceImei
} from '@/api/instrumentManagement'
import { UNIT_TABLE, PRESSURE_UNITS, transferToUnit } from '@/utils'

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
    },
    // 当前树节点数据
    curProject: {
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

const dialogInnerStyle: any = reactive({
    height: '170px'
}) // 弹窗高度
const loading: any = ref(false) // 加载样式
const formData: any = ref({}) // 表单数据
const lineDatas: any = ref([]) // 显示
const curLineDatas: any = ref([]) // 显示
const displayUnits: any = ref([]) // 单位

// 弹窗打开时触发
const open = () => {
    // 重置参数
    reset()
    // 请求数据
    if (props.mode === 'edit') {
        lineDatas.value = props.rowData?.node_data?.line_datas || []
        dialogInnerStyle.height = lineDatas.value.length ? '600px' : '330px'
        // 单位
        for (let type of PRESSURE_UNITS) {
            let option = {
                value: type,
                label: UNIT_TABLE[type as any].name
            }
            displayUnits.value.push(option)
        }
        for (let ld of lineDatas.value) {
            const lp = ld.line_param
            const data = reactive({
                line: ld.node_line,
                displayValue: transferToUnit(ld.value, ld.unit, lp.disp_unit).toFixed(ld.point),
                unitName: unitCodeToName(lp.disp_unit),
                setDesc: lp.set_desc == '1',
                lineDesc: lp.set_desc == '1' ? lp.line_desc : unitCodeToDesc(lp.disp_unit),
                pointPos: ld.point,
                isPressureUnit: PRESSURE_UNITS.indexOf(ld.unit) !== -1,
                displayUnit: lp.disp_unit,
                is_cus_unit: lp.is_cus_unit == 0 ? false : true,
                cus_unit: lp.cus_unit,
                lo_alarm_1: lp.lo_alarm_1,
                l1_open: (lp.alarm_switch & 0x0001) != 0 ? true : false,
                lo_recover_1: lp.lo_recover_1,
                hi_alarm_1: lp.hi_alarm_1,
                hi_recover_1: lp.hi_recover_1,
                lo_alarm_2: lp.lo_alarm_2,
                l2_open: (lp.alarm_switch & 0x0004) != 0 ? true : false,
                lo_recover_2: lp.lo_recover_2,
                hi_alarm_2: lp.hi_alarm_2,
                h2_open: (lp.alarm_switch & 0x0008) != 0 ? true : false,
                hi_recover_2: lp.hi_recover_2
            })
            curLineDatas.value.push(data)
        }
    } else if (props.mode === 'update_imei' || props.mode === 'add_SIM') {
        dialogInnerStyle.height = '120px'
    } else {
        dialogInnerStyle.height = '170px'
    }
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

const offset = ref(0)

// 添加数据
const confirm = () => {
    // form 表单验证是否通过
    formValidate.value.validate((valid: any) => {
        if (!valid) return
        loading.value = true
        if (props.mode === 'add_instrument') {
            // 中文逗号替换为英文逗号
            const imeiArr = curFormData.value.imei.replace(/，/g, ',').split(',')
            for (let item of imeiArr) {
                // 新建仪表
                const params = {
                    access_token: userStore.token,
                    project_id: props.curProject.project_id,
                    node_name: curFormData.value.node_name,
                    imei: item || ''
                }
                insertNode(params)
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
        } else if (props.mode === 'add_SIM') {
            // 新建SIM
            const simArr = curFormData.value.sim.replace(/，/g, ',').split(',')
            const imeiArr = curFormData.value.imei.replace(/，/g, ',').split(',')
            for (let index in imeiArr) {
                const params = {
                    project_id: props.curProject.project_id,
                    sim: simArr[index],
                    imei: imeiArr[index]
                }
                insertSim(params)
                    .then(() => {
                        ElMessage.success('添加成功')
                        emit('confirm')
                    })
                    .catch(() => {
                        ElMessage.error('添加失败，请检查信息是否有误')
                    })
                    .finally(() => {
                        setTimeout(() => {
                            loading.value = false
                        }, 100)
                    })
            }
        } else if (props.mode === 'update_imei') {
            // 替换更新
            const params = {
                access_token: userStore.token,
                Oimei: props.rowData.imei,
                Nimei: curFormData.value.Nimei
            }
            displaceImei(params).then(() => {
                ElMessage.success('更新成功')
                emit('confirm')
            })
        } else {
            // 修改信息
            const lineParams = []
            for (let info of curLineDatas.value) {
                const lp: any = {
                    line: info.line,
                    set_desc: info.setDesc ? '1' : '0',
                    line_desc: info.lineDesc,
                    dot_pos: info.pointPos,
                    disp_unit: info.displayUnit,
                    hi_alarm_2: info.hi_alarm_2,
                    hi_alarm_1: info.hi_alarm_1,
                    lo_alarm_1: info.lo_alarm_1,
                    lo_alarm_2: info.lo_alarm_2,
                    hi_recover_2: info.hi_recover_2,
                    hi_recover_1: info.hi_recover_1,
                    lo_recover_1: info.lo_recover_1,
                    lo_recover_2: info.lo_recover_2,
                    is_cus_unit: info.is_cus_unit ? 1 : 0,
                    cus_unit: info.cus_unit
                }
                lp.alarm_switch =
                    (info.h2_open ? 0x0008 : 0) |
                    (info.h1_open ? 0x0002 : 0) |
                    (info.l1_open ? 0x0001 : 0) |
                    (info.l2_open ? 0x0004 : 0)

                lineParams.push(lp)
            }
            const params = {
                access_token: userStore.token,
                node_id: props.rowData.node_id,
                main_param: JSON.stringify({
                    node_name: curFormData.value.node_name,
                    group: curFormData.value.group,
                    node_tel: curFormData.value.node_tel,
                    sample_gap: curFormData.value.sample_gap,
                    send_gap: curFormData.value.send_gap,
                    imei: curFormData.value.imei
                }),
                line_params: JSON.stringify(lineParams)
            }
            updateNodeFullParams(params).then(() => {
                ElMessage.success('修改成功')
                emit('confirm')
            })
        }
    })
}

// 调整仪表（对表）
const submitOffset = () => {
    const params = {
        access_token: userStore.token,
        node_id: props.rowData.node_id,
        offset: offset.value
    }
    setOffset(params).then(() => {
        ElMessage({
            type: 'success',
            message: '指令发送成功, 请唤醒仪表并留意仪表面板提示信息',
            duration: 5000
        })
        emit('confirm')
    })
}

// 调零
const submitZero = () => {
    const params = {
        access_token: userStore.token,
        node_id: props.rowData.node_id
    }
    setZero(params).then(() => {
        ElMessage({
            type: 'success',
            message: '指令发送成功, 请唤醒仪表并留意仪表面板提示信息',
            duration: 5000
        })
        emit('confirm')
    })
}

// 关闭弹窗
const close = () => {
    reset()
    emit('close')
}

// 重置参数
const reset = () => {
    dialogInnerStyle.height = '170px'
    loading.value = false
    formData.value = {}
    lineDatas.value = []
    curLineDatas.value = []
    displayUnits.value = []

    curFormData.value = {}
    formValidate.value = {}
}

const unitCodeToDesc = (code: any) => {
    for (let elem of UNIT_TABLE) {
        if (elem.type == code) {
            return elem.desc
        }
    }
}

const unitCodeToName = (code: any) => {
    for (let elem of UNIT_TABLE) {
        if (elem.type == code) {
            return elem.name
        }
    }
    return ''
}
</script>

<style lang="scss" scoped>
::v-deep(.el-select__wrapper) {
    height: 34px;
}
</style>
