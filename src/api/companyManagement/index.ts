import ajax from '@/utils/ajax'

/* 公司归属关系 companyOwnershipRelationship */
// 获取未分配的公司
export const getCompanyPrepareSonList = (params: any) =>
    ajax.post('/GetCompanyPrepareSonList', params)

// 添加
export const addCompanySons = (params: any) => ajax.post('/AddCompanySons', params)

// 删除
export const removeOneSon = (params: any) => ajax.post('/RemoveOneSon', params)
