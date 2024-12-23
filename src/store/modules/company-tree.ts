import { defineStore } from 'pinia'
import { getCompanyTree, getCompanyProjects } from '@/api/home'
import { reactive } from 'vue'
import useUserStore from '@/store/modules/user'

const userStore = useUserStore()

const useCompanyTreeStore = defineStore('CompanyTree', {
    // 存储数据的地方
    state: (): any => {
        return {
            treeData: [], // 树数据
            noChildTreeData: [], // 没有children树数据
            companyCount: 0, // 公司总数
            itemCount: 0, // 项目总数
            treeLoading: false
        }
    },
    // 处理逻辑的地方
    actions: {
        async getTreeData() {
            this.treeData = []
            this.noChildTreeData = []
            this.companyCount = 0
            this.itemCount = 0
            this.treeLoading = true
            // 请求接口获取数据
            const params = {
                access_token: userStore.token,
                company_id: userStore.userInfo.company_id
            }
            const res: any = await getCompanyTree(params)
            if (!res.company_tree) return
            // 组装 hasChild 树
            const copyTree = reactive([JSON.parse(JSON.stringify(res.company_tree))]) // 深拷贝
            this.assembleChildTree(copyTree)
            // 组装 noChild 树
            const copyNoChildTree = reactive([JSON.parse(JSON.stringify(res.company_tree))])
            this.assembleNoChildTree(copyNoChildTree)
            this.treeLoading = false
        },
        // 组装 hasChild 树
        assembleChildTree(tree: any) {
            if (tree.length) {
                tree.forEach((item: any) => {
                    item.type = 'c'
                    item.id = item.company_id
                    this.companyCount += 1
                    this.addProjectsToCompany(item)
                    if (item.children) this.assembleChildTree(item.children)
                })
                this.treeData = tree
            }
        },
        // 组装 noChild 树
        assembleNoChildTree(tree: any) {
            if (tree.length) {
                tree.forEach((item: any) => {
                    item.type = 'c'
                    item.id = item.company_id
                    if (item.children) this.assembleNoChildTree(item.children)
                })
                this.noChildTreeData = tree
            }
        },
        async addProjectsToCompany(child: any) {
            const data = {
                access_token: userStore.token,
                company_id: child.company_id
            }
            const res: any = await getCompanyProjects(data)
            for (let item of res.project_list) {
                const projectNode = {
                    ...item,
                    id: 'c_' + child.company_id + '_p_' + item.project_id, //为了工程ID与公司ID不重复,工程ID加上 p_ 前缀
                    company_name: child.company_name,
                    label: item.project_name,
                    type: 'p'
                }
                child.children.push(projectNode)
                this.itemCount += 1
            }
        },
        // 清空store
        resetStore() {
            this.$reset()
        }
    },
    // 使用persist插件对state里面属性进行缓存
    persist: {
        storage: sessionStorage // 设值存储方式，默认localStorage
    },
    // 计算属性
    getters: {}
})

export default useCompanyTreeStore
