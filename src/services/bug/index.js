/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-08 17:53:19
 * @LastEditTime: 2019-08-16 16:43:52
 * @LastEditors: Please set LastEditors
 */
import request from '@u/request'

//漏洞查询列表
export function getBugList (params) {
  return request('post', '/vuln/vulninfo/query/list', params )
}
//查询关联漏洞
export function getRelevanceBugList (params) {
  return request('post', '/vuln/vulninfo/query/nameList', params )
}
//漏洞删除
export function deleteBug (params) {
  return request('post', '/vuln/vulninfo/delete', params )
}
//漏洞详情
export function getBugDetail (params) {
  return request('post', '/vuln/vulninfo/query/detail', params )
}
//漏洞变更
export function bugChange (params) {
  return request('post', '/vuln/vulninfo/update', params )
}
//漏洞导入
export function bugImport (params) {
  return request('post', '/vuln/vulninfo/import', params )
}
//漏洞入库批量
export function bugInto (params) {
  return request('post', '/vuln/vulninfo/into', params )
}
//漏洞类型列表
export function listVulType (params) {
  return request('post', '/vuln/vulninfo/listVulType', params )
}
//服务列表
export function getServerList (params) {
  return request('post', '/vuln/vulnserver/query/list', params )
}
//漏洞关联的服务列表
export function getBugServerList (params) {
  return request('post', '/vuln/vulnserver/query/all', params )
}
//新增服务
export function AddBugServer (params) {
  return request('post', '/vuln/vulnserver/insert/batchEffactServerAdd', params )
}
//删除服务映射
export function deleteBugServer (params) {
  return request('post', '/vuln/vulnserver/delect/batch', params )
}
//漏洞关联的链接列表
export function getBugLinkList (params) {
  return request('post', '/vuln/vulnreference/query/vulnId', params )
}
//新增链接
export function AddBugLink (params) {
  return request('post', '/vuln/vulnreference/save/single', params )
}
//删除链接映射
export function deleteBugLink (params) {
  return request('post', '/vuln/vulnreference/delete/list', params )
}
//漏洞关联的端口列表
export function getBugPortList (params) {
  return request('post', '/vuln/vulnport/effectPortList', params )
}
//新增端口
export function addBugPort (params) {
  return request('post', '/vuln/vulnport/effectPortAdd', params )
}
//删除端口映射
export function deleteBugPort (params) {
  return request('post', '/vuln/vulnport/batchDelete', params )
}
//查询方案
export function getBugPlanList (params) {
  return request('post', '/vuln/vulnsolution/query/all', params )
}
//删除方案
export function deleteBugPlan (params) {
  return request('post', '/vuln/vulnsolution/delete/id', params )
}
//新增方案
export function AddBugPlan (params) {
  return request('post', '/vuln/vulnsolution/save/all', params )
}
//修改方案
export function editBugPlan (params) {
  return request('post', '/vuln/vulnsolution/update/all', params )
}
//漏洞解决方案：模糊查询补丁
export function bugQueryPatch (params) {
  return request('post', '/patch/detail/query/patch/list', params )
}
//漏洞解决方案：删除补丁
export function bugQueryDelete (params) {
  return request('post', '/vuln/vulnpatchmap/delete/id', params )
}
//漏洞解决方案：保存补丁
export function addPatchQuery (params) {
  return request('post', '/vuln/vulnpatchmap/save/batch', params )
}
//漏洞解决方案：分页查询关联补丁
export function queryBugPatchPage (params) {
  return request('post', '/vuln/vulnpatchmap/queryPatch/list', params )
}
//漏洞解决方案：全量查询关联补丁
export function queryBugPatchPageAll (params) {
  return request('post', '/vuln/vulnpatchmap/queryPatch/all', params)
}
//获取品类型号
export function getVulnCpe (params) {
  return request('post', '/vuln/vulnCpe/queryList', params )
}
//保存品类型号
export function saveVulnCpe (params) {
  return request('post', '/vuln/vulnCpe/save', params )
}
//删除品类型号
export function deleteVulnCpe (params) {
  return request('post', '/vuln/vulnCpe/delete', params )
}
//查看漏洞方案是否被删除
export function checkBugPlan (params) {
  return request('post', '/vuln/vulnsolution/query/status', params )
}
//查看漏洞是否被删除
export function checkBug (params) {
  return request('post', '/vuln/vulninfo/queryVulStatus', params )
}
//查看漏洞去重后的品类型号
export function getBugCategory (params) {
  return request('post', '/hardsoftlib/query/category', params )
}
//查看漏洞临时库详情
export function tempDetail (params) {
  return request('post', '/vuln/temp/detail', params )
}
//查看漏洞临时库列表
export function tempList (params) {
  return request('post', '/vuln/temp/list', params )
}
//漏洞临时库迁移
export function tempMigrateVul (params) {
  return request('post', '/vuln/temp/migrateVul', params )
}
//查询漏洞临时是否被库迁移
export function checkTemp (params) {
  return request('post', '/vuln/temp/queryVulStatus', params )
}
//查询临时库参考链接
export function getTempLink (params) {
  return request('post', '/vuln/vulnreference/query/temp/list', params )
}
//查询临时库影响品类型号
export function getTempCpe (params) {
  return request('post', '/vuln/vulnCpe/temp/list', params )
}
