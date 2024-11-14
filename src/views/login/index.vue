<template>
    <div class="login-container">
        <el-row class="login-row">
            <el-col class="login-col">
                <el-form :model="loginForm" class="login-form" :rules="rules" ref="ruleFormRef">
                    <h1>欢迎使用物联网远程监控系统</h1>
                    <!-- 账号密码 -->
                    <el-form-item label="账号:" prop="username">
                        <el-input
                            v-model="loginForm.username"
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
import { getTime } from '@/utils/time'

// 收集登录信息
let loginForm = reactive({
    username: '',
    password: ''
})

let useStore = useUserStore()

let loading = ref(false)

let $router = useRouter()

const ruleFormRef = ref()

const rules = reactive({
    username: [
        { required: true, message: '请输入账号', trigger: 'change' },
        { min: 2, max: 10, message: '账号长度为2-10位', trigger: 'change' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'change' },
        { min: 3, max: 20, message: '密码长度为6-20位', trigger: 'change' }
    ]
})

const login = async (formEl: any) => {
    // 登录按钮转圈
    loading.value = true
    console.log(formEl)
    if (!formEl) return
    await formEl.validate((valid: any, fields: any) => {
        if (valid) {
            console.log('submit!')
        } else {
            console.log('error submit!', fields)
        }
    })
    try {
        await useStore.userLoginFunc(loginForm)
        // 登录后跳转的页面
        setTimeout(() => {
            loading.value = false
            $router.push('/home')
            // 登录成功后的打招呼信息
            ElNotification({
                type: 'success',
                message: '欢迎回来！',
                title: `Hi, ${getTime()}`,
                duration: 1500
            })
        }, 500)
    } catch (error) {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.login-container {
    width: 100%;
    height: 100%;
    // background-image: url('@/assets/images/login-bg.jpg');
    background-repeat: no-repeat;
    background-size: cover;
    background-position: 5%;
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
