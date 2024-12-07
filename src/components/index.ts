// 引入组件
import SvgIcon from './svg-icon.vue'
import PsForm from './ps-ui/ps-form.vue'
import PsTree from './ps-ui/ps-tree.vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import PsSearch from './ps-ui/ps-search.vue'
import PsPagination from './ps-ui/ps-pagination.vue'
import PsSearchTable from './ps-ui/ps-search-table.vue'
import PsDialog from './ps-ui/ps-dialog.vue'

// 整合到一个对象中
const allGlobalComponents = {
    SvgIcon,
    PsForm,
    PsTree,
    PsSearch,
    PsPagination,
    PsSearchTable,
    PsDialog
}

// 对外暴露插件对象
export default {
    install(app: any) {
        // 自定义组件
        Object.keys(allGlobalComponents).forEach((key) => {
            app.component(key, (allGlobalComponents as any)[key])
        })
        // element-icon
        for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
            app.component(key, component)
        }
    }
}
