import request from '@u/request'

// 获取基准项列表
export const getBaselineList = (params) => {
  return request('post', '/baseline/query/list', params)
}
// 添加基准项
export const addBaseline = (params) => {
  return request('post', '/baseline/save/single', params)
}
// 修改基准项
export const updateBaseline = (params) => {
  return request('post', '/baseline/update/single', params)
}
// 删除基准项
export const deleteBaseline = (params) => {
  return request('post', '/baseline/delete/idList', params)
}
// 导入基准项
export const importBaseline = (params) => {
  return request('post', '/baseline/import', params)
}
// 导出基准项
export const exportBaseline = (params) => {
  return request('post', '/baseline/export', params)
}
//获取详情
export const queryBaseline = (params) => {
  return request('post', '/baseline/query/id', params)
}
//获取关联服务
export const getRelationService = (params) => {
  return request('post', '/sysservicelib/relation/service', params)
}
//操作系统
export const getRelationOs = (params) => {
  return request('post', '/baseline/pullDown/os', params)
}
//查询基准项状态
export const checkBaselineStatus = (params) => {
  return request('post', '/baseline/status', params)
}
//下载判断
export const checkDownloadAuth = (url, params) => {
  return request('post', '/user/isAuth', params)
}