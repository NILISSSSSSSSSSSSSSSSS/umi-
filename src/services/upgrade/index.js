
import request from '@u/request'

// 升级记录列表
export const getRecordList = (params) => {
  return request('post', '/upgrade/record/query/record', params)
}
// 查询服务器地址
export const queryServerSet = (params) => {
  return request('post', '/upgrade/task/queryMasterUrl', params)
}
// 设置服务器地址
export const setServer = (params) => {
  return request('post', '/upgrade/task/modifyMasterUrl', params)
}
// 查询定时任务
export const queryTaskInfo = (params) => {
  return request('post', '/upgrade/task/queryTaskInfo', params)
}
// 设置定时任务
export const setTaskInfo = (params) => {
  return request('post', '/upgrade/task/modifyTaskInfo', params)
}
// 下载：全库升级包判空
export const judgeAll = (params) => {
  return request('post', '/upgrade/master/judge/all', params)
}
// 下载： 资产升级包判空
export const judgeAssets = (params) => {
  return request('post', '/upgrade/master/judge/asset', params)
}
// 下载：配置升级包判空
export const judgeBaseline = (params) => {
  return request('post', '/upgrade/master/judge/baseline', params)
}
// 下载：漏洞升级包判空
export const judgeVuln = (params) => {
  return request('post', '/upgrade/master/judge/vuln', params)
}
// 下载：补丁升级包判空
export const judgePatch = (params) => {
  return request('post', '/upgrade/master/judge/patch', params)
}

export default{
  getRecordList,
  queryServerSet,
  setServer,
  queryTaskInfo,
  setTaskInfo,
  judgeAll,
  judgeAssets,
  judgeBaseline,
  judgePatch,
  judgeVuln
}