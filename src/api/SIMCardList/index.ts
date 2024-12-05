import ajax from '@/utils/ajax'

// 管理员
export const getSimInfo = () => ajax.post('/GetSimInfo')

// 个人
export const companySim = (params: any) => ajax.get('/CompanySim', { params })

// 全部更新
export const allSimUpdate = () => ajax.get('/allSimUpdate')
