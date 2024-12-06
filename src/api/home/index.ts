import ajax from '@/utils/ajax'

// 获取公司树：父级
export const getCompanyTree = (params: object) => ajax.post('/GetCompanyTree', params)

// 获取公司树：子级
export const getCompanyProjects = (params: object) => ajax.post('/GetCompanyProjects', params)

// 每个父节点对应的数据
export const getCompanysProjects = (params: object) => ajax.post('/GetCompanysProjects', params)

// 每个子节点对应的数据
export const getProjectsNodes = (params: any) => ajax.post('/GetProjectsNodes', params)
