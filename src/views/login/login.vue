<template>
    <div class="login-container">
        <el-row class="login-row">
            <el-col class="login-col">
                <el-form :model="loginForm" class="login-form" :rules="rules" ref="ruleFormRef">
                    <h1>欢迎使用物联网远程监控系统</h1>
                    <!-- 账号密码 -->
                    <el-form-item label="账号:" prop="account">
                        <el-input
                            v-model="loginForm.account"
                            prefix-icon="UserFilled"
                            @keyup.enter.native="login(ruleFormRef)"
                        ></el-input>
                    </el-form-item>
                    <el-form-item label="密码:" prop="password">
                        <el-input
                            v-model="loginForm.password"
                            prefix-icon="Lock"
                            type="password"
                            show-password
                            @keyup.enter.native="login(ruleFormRef)"
                        ></el-input>
                    </el-form-item>
                    <!-- 登录按钮 -->
                    <el-form-item>
                        <el-button
                            type="primary"
                            style="width: 100%"
                            :loading="loading"
                            @click="login(ruleFormRef)"
                            >登录</el-button
                        >
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElNotification } from 'element-plus'

import useUserStore from '@/store/modules/user'
import { getTime } from '@/utils'

// ------------------------------------
// 路由
const $router = useRouter()
// 仓库
const userStore = useUserStore()
// ------------------------------------
// el-form属性
const ruleFormRef = ref()
// form表单校验规则
const rules = reactive({
    account: [{ required: true, message: '请输入账号', trigger: 'change' }],
    password: [{ required: true, message: '请输入密码', trigger: 'change' }]
})

// ------------------------------------
// 收集登录信息
const loginForm = reactive({
    account: '',
    password: ''
})
// 登录按钮加载
const loading = ref(false)

const login = async (formEl: any) => {
    // 登录按钮转圈
    loading.value = true
    if (!formEl) return
    // 校验表单
    await formEl.validate(async (valid: any, fields: any) => {
        if (valid) {
            try {
                // 请求接口
                await userStore.userLoginFunc(loginForm)
                // 登录后跳转的页面
                loading.value = false
                $router.push('/home')
                // 登录成功后的打招呼信息
                ElNotification({
                    type: 'success',
                    message: '欢迎回来！',
                    title: `Hi, ${userStore.userInfo.company_full_name}, ${getTime()}`,
                    offset: 50,
                    duration: 2000
                })
            } catch (error) {
                loading.value = false
            }
        } else {
            console.log('error submit!', fields)
        }
    })
}
</script>

<style lang="scss" scoped>
.login-container {
    width: 100%;
    height: 100%;
    // background-image: url('@/assets/images/login-bg.jpg');
    // background-repeat: no-repeat;
    // background-size: cover;
    // background-position: 5%;
    .login-row {
        height: 100%;
        .login-col {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            .login-form {
                h1 {
                    color: #409eff;
                    padding-bottom: 20px;
                }
            }
        }
    }
}
</style>
