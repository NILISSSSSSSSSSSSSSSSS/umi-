import request from '@u/request'

// 获取厂商列表
export const getManufacturerList = () => {
  return request('post', '/manufacturer')
}
// 获取组件列表
export const getPartList = (params) => {
  return request('post', '/assemblylib/query/list', params)
}
// 获取组件基本信息
export const getPartBaseInfo = (params) => {
  return request('post', '/assemblylib/query/id', params)
}
// 修改组件
export const editPart = (param) => {
  return request('post', '/assemblylib/update/single', param)
}
// 删除组件
export const delPart = (param) => {
  return request('post', '/assemblylib/delete/batch', param)
}
// 入库组件
export const partPutStorage = (param) => {
  return request('post', '/assemblylib/assembly/storage', param)
}
// 登记组件
export const registerPart = (param) => {
  return request('post', '/assemblylib/save/single', param)
}
//检测该组件是否存在
export const statusDetect = (param) => {
  return request('post', '/assemblylib/statusDetect', param)
}
/*****************关联硬件操作***************************/

// 获取组件关联的硬件列表
export const getPartRelateHard = (params) => {
  return request('post', '/hardassemblyrelation/query/list', params)
}
// 组件添加硬件请求
export const partAddHard = (params) => {
  return request('post', '/hardassemblyrelation/save/assemblyRelHardBatch', params)
}

// 组件添删除件请求
export const partDelHard = (params) => {
  return request('post', '/hardassemblyrelation/delete/assemblyRelHard', params)
}
/*****************关联软件操作***************************/

// 获取组件关联的软件列表
export const getPartRelateSoft = (params) => {
  return request('post', '/assemblysoftrelation/query/list', params)
}
// 组件添加软件请求
export const partAddSoft = (params) => {
  return request('post', '/assemblysoftrelation/save/assemblyRelSoft', params)
}
// 组件添删除件请求
export const partDelSoft = (params) => {
  return request('post', '/assemblysoftrelation/delete/assemblyRelSoft', params)
}
