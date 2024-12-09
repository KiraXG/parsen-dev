import ajax from '@/utils/ajax'

// 获取GPS列表
export const getLbsList = (params: any) => ajax.post('/GetLbsList', params)
