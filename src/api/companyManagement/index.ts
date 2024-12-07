import ajax from '@/utils/ajax'

/* 公司归属关系 companyOwnershipRelationship */
// 获取未分配的公司
export const getCompanyPrepareSonList = (params: any) =>
    ajax.post('/GetCompanyPrepareSonList', params)

// 添加
export const addCompanySons = (params: any) => ajax.post('/AddCompanySons', params)

// 删除
export const removeOneSon = (params: any) => ajax.post('/RemoveOneSon', params)

/* 公司数据管理 companyManagement */
// 获取列表
export const getCompanyList = (params: any) => ajax.post('/GetCompanyList', params)

// 新建
export const insertCompany = (params: any) => ajax.get('/InsertCompany', { params })

// 修改
export const setCompanyInfo = (params: any) => ajax.post('/SetCompanyInfo', params)

// 删除
export const removeCompany = (params: any) => ajax.post('/RemoveCompany', params)
