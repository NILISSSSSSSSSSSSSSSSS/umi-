
import request from '@u/request'

// 漏洞报表
export const patchReport = (params) => {
  return request('post', '/report/patch', params)
}
// 配置报表
export const baselineReport = (params) => {
  return request('post', '/baseline/getWeekData', params)
}
// 资产报表
export const assetReport = (params) => {
  return request('post', '/report/lineChart/newAddAssetCount', params)
}

// 资产总数
export const assetTotal = (params) => {
  return request('post', '/report/assetLibCount', params)
}

// 漏洞报表
export const bugReport = (params) => {
  return request('post', '/vuln/report/vuln', params)
}
export default{
  patchReport,
  baselineReport,
  assetReport,
  bugReport,
  assetTotal
}