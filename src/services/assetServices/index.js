import request from '@u/request'

// 获取服务类型列表
export const getServeTypes = (params) => {
  return request('post', '/sysservicelib/query/service', params)
}

// 登记服务
export const registerServe = (params) => {
  return request('post', '/sysservicelib/save/single', params)
}
// 获取服务基本信息
export const getServeBaseInfo = (params) => {
  return request('post', '/sysservicelib/query/id', params)
}
// 修改服务基本信息
export const editService = (params) => {
  return request('post', '/sysservicelib/update/single', params)
}
// 获取服务列表
export const getServicesList = (params) => {
  return request('post', '/sysservicelib/query/list', params)
}
// 服务入库
export const putStorage = (params) => {
  return request('post', '/sysservicelib/input/single', params)
}
// 批量服务入库
export const batchPutStorage = (params) => {
  return request('post', '/sysservicelib/input/batch', params)
}
// 删除服务
export const delServe = (params) => {
  return request('post', '/sysservicelib/delete/id', params)
}// 批量删除服务
export const batchDelServe = (params) => {
  return request('post', '/sysservicelib/delete/batch/id', params)
}
// 验证该服务是否存在
export const queryExist = (params) => {
  return request('post', '/sysservicelib/query/exist', params)
}
/****************提供该服务的软件操作**************************/
// 删除关联软件
export const serveDelSoft = (params) => {
  return request('post', '/softservicerelation/delete/service/relation', params)
}
// 添加关联软件
export const serveAddSoft = (params) => {
  return request('post', '/softservicerelation/save/service/relation', params)
}
// 获取服务关联软件列表
export const getServeRelateSoft = (params) => {
  return request('post', '/softservicerelation/query/software/id', params)
}
/****************关联端口操作**************************/
// 删除关联端口
export const serveDelPort = (params) => {
  return request('get', '/serviceportrelation/delete/port/id', params)
}
// 添加关联端口
export const serveAddPort = (params) => {
  return request('get', '/serviceportrelation/save/relation', params)
}
// 获取服务关联端口列表
export const getServeRelatePort = (params) => {
  return request('post', '/serviceportrelation/query/port/id', params)
}
/****************关联服务操作**************************/
// 删除关联服务
export const serveDelServe = (params) => {
  return request('post', '/servicedepend/delete/service/id', params)
}
// 添加关联服务
export const serveAddServe = (params) => {
  return request('post', '/servicedepend/save/relation', params)
}
// 获取服务关联服务列表
export const getServeRelateServe = (params) => {
  return request('post', '/servicedepend/query/service/id', params)
}
/****************关联协议操作**************************/
// 删除关联协议
export const serveDelProtocol = (params) => {
  return request('post', '/serviceprotocolrelation/delete/relation', params)
}
// 添加关联协议
export const serveAddProtocol = (params) => {
  return request('post', '/serviceprotocolrelation/save/single', params)
}
// 获取服务关联协议列表
export const getServeRelateProtocol = (params) => {
  return request('post', '/serviceprotocolrelation/query/protocol/id', params)
}
/****************依赖该服务的软件操作**************************/
// 删除提供该服务的软件
export const serveDelRestrictedSoft = (params) => {
  return request('post', '/softservicelib/delete/service/relation', params)
}
// 添加提供该服务的软件
export const serveAddRestrictedSoft = (params) => {
  return request('post', '/softservicelib/save/service/relation', params)
}
// 获取提供该服务的软件
export const getServeRestrictedSoft = (params) => {
  return request('post', '/softservicelib/query/software/id', params)
}
