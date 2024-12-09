export const constantRoutes = [
    {
        // 未输入路径名重定向至login页面
        path: '/',
        name: 'defaultPage',
        redirect: '/login',
        meta: {
            title: 'defaultPage',
            show: false
        }
    },
    {
        // 未匹配到任何路由跳转到404页面
        path: '/:pathMatch(.*)*',
        redirect: '/404',
        name: 'Any',
        meta: {
            title: 'Any',
            show: false
        }
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/views/login/login.vue'), // 组件按需加载
        meta: {
            title: '登录',
            show: false,
            keepAlive: true // 需要缓存
        }
    },
    {
        path: '/layout',
        name: 'layout',
        component: () => import('@/layout/index.vue'),
        meta: {
            title: 'layout',
            show: true
        },
        children: [
            {
                path: '/home',
                name: 'home',
                component: () => import('@/views/home/home.vue'),
                meta: {
                    title: '工作台',
                    icon: 'HelpFilled',
                    show: true,
                    keepAlive: true
                }
            },
            {
                path: '/instrumentData',
                name: 'instrumentData',
                meta: {
                    title: '仪表数据',
                    icon: 'Histogram',
                    show: true,
                    keepAlive: true
                },
                redirect: '/instrumentData/realTimeData',
                children: [
                    {
                        path: '/instrumentData/realTimeData',
                        name: 'realTimeData',
                        component: () => import('@/views/instrumentData/realTimeData.vue'),
                        meta: {
                            title: '实时数据',
                            show: true,
                            keepAlive: true
                        }
                    }
                ]
            },
            {
                path: '/remoteMonitoring',
                name: 'remoteMonitoring',
                component: () => import('@/views/remoteMonitoring/index.vue'),
                meta: {
                    title: '远程监控',
                    icon: 'MagicStick',
                    show: true,
                    keepAlive: true
                }
            },
            {
                path: '/instrumentManagement',
                name: 'instrumentManagement',
                meta: {
                    title: '仪表管理',
                    icon: 'Grid',
                    show: true,
                    keepAlive: true
                },
                redirect: '/instrumentManagement/instrumentDataManagement',
                children: [
                    {
                        path: '/instrumentManagement/instrumentDataManagement',
                        name: 'instrumentDataManagement',
                        component: () =>
                            import(
                                '@/views/instrumentManagement/instrumentDataManagement.vue'
                            ),
                        meta: {
                            title: '仪表数据管理',
                            show: true,
                            keepAlive: true
                        }
                    }
                ]
            },
            {
                path: '/projectManagement',
                name: 'projectManagement',
                meta: {
                    title: '项目管理',
                    icon: 'List',
                    show: true,
                    keepAlive: true
                },
                redirect: '/projectManagement/projectDataManagement',
                children: [
                    {
                        path: '/projectManagement/projectDataManagement',
                        name: 'projectDataManagement',
                        component: () =>
                            import('@/views/projectManagement/projectDataManagement.vue'),
                        meta: {
                            title: '项目数据管理',
                            show: true,
                            keepAlive: true
                        }
                    }
                ]
            },
            {
                path: '/companyManagement',
                name: 'companyManagement',
                meta: {
                    title: '公司管理',
                    icon: 'UserFilled',
                    show: true,
                    keepAlive: true
                },
                redirect: '/companyManagement/companyOwnershipRelationship',
                children: [
                    {
                        path: '/companyManagement/companyOwnershipRelationship',
                        name: 'companyOwnershipRelationship',
                        component: () =>
                            import(
                                '@/views/companyManagement/companyOwnershipRelationship/companyOwnershipRelationship.vue'
                            ),
                        meta: {
                            title: '公司归属关系',
                            show: true,
                            keepAlive: true
                        }
                    },
                    {
                        path: '/companyManagement/companyDataManagement',
                        name: 'companyDataManagement',
                        component: () =>
                            import('@/views/companyManagement/companyDataManagement/companyDataManagement.vue'),
                        meta: {
                            title: '公司数据管理',
                            show: true,
                            keepAlive: true
                        }
                    }
                ]
            },
            {
                path: '/SIMCardManagement',
                name: 'SIMCardManagement',
                meta: {
                    title: 'SIM卡管理',
                    icon: 'Promotion',
                    show: true,
                    keepAlive: true
                },
                redirect: '/SIMCardManagement/SIMCardList',
                children: [
                    {
                        path: '/SIMCardManagement/SIMCardList',
                        name: 'SIMCardList',
                        component: () => import('@/views/SIMCardManagement/SIMCardList.vue'),
                        meta: {
                            title: 'SIM卡列表',
                            show: true,
                            keepAlive: true
                        }
                    }
                ]
            }
        ]
    },
    {
        path: '/404',
        name: '404',
        component: () => import('@/views/404/404.vue'),
        meta: {
            show: false
        }
    }
]
