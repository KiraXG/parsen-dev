import ajax from '@/utils/ajax'

// 新建仪表
export const insertNode = (params: any) => ajax.post('/InsertNode', params)

// 新建仪表
export const insertSim = (params: any) => ajax.get('/InsertSim', { params })

// 修改仪表
export const updateNodeFullParams = (params: any) => ajax.post('/UpdateNodeFullParams', params)

// 删除仪表
export const deleteNode = (params: any) => ajax.post('/DeleteNode', params)

// 替换更新
export const displaceImei = (params: any) => ajax.get('/DisplaceImei', { params })

// 调整仪表（对表）
export const setOffset = (params: any) => ajax.post('/SetOffset', params)

// 调零
export const setZero = (params: any) => ajax.post('/SetZero', params)

// 表格行显示按钮
export const showControl = (params: any) => ajax.post('/ShowControl', params)
