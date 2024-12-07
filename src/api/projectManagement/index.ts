import ajax from '@/utils/ajax'

// 新建
export const insertProject = (params: any) => ajax.get('/InsertProject', { params })

// 修改
export const updateProject = (params: any) => ajax.post('/UpdateProject', params)

// 删除
export const deleteProject = (params: any) => ajax.post('/DeleteProject', params)
