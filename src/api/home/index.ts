import ajax from '@/utils/ajax'

// 获取公司树：父级
export const getCompanyTree = (params: object) => ajax.post('/GetCompanyTree', params)

// 获取公司树：子级
export const getCompanyProjects = (params: object) => ajax.post('/GetCompanyProjects', params)

// 每个子节点对应的数据
export const GetProjectsNodes = (params: any) => ajax.post('/GetProjectsNodes', params)
