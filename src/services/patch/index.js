import request from '@u/request'

// 获取补丁列表
export function getPatcList (params) {
  return request('post', '/patch/info/query', params)
}
//补丁导入
export function patchImport (params) {
  return request('post', '/patch/batch/import', params )
}
//补丁入库批量
export function patchInto (params) {
  return request('post', '/patch/warehousing', params )
}
//补丁删除
export function deletePatch (params) {
  return request('post', '/patch/delete', params )
}
//新增补丁实体
export function AddPatchEntity (params) {
  return request('post', '/patch/edit/add/patch/entity', params )
}
//新增前置补丁
export function AddPatchPre (params) {
  return request('post', '/patch/edit/add/pre/patch', params )
}
//新增服务映射
export function AddPatchServer (params) {
  return request('post', '/patch/edit/add/server', params )
}
//新增端口映射
export function addPatchPort (params) {
  return request('post', '/patch/edit/add/port', params )
}
//删除补丁实体
export function deletePatchEntity (params) {
  return request('post', '/patch/edit/del/patch/entity', params )
}
//删除端口映射
export function deletePatchPort (params) {
  return request('post', '/patch/edit/del/port', params )
}
//删除前置补丁
export function deletePatchPre (params) {
  return request('post', '/patch/edit/del/pre/patch', params )
}
//删除服务映射
export function deletePatchServer (params) {
  return request('post', '/patch/edit/del/server', params )
}
//修改补丁信息
export function patchChange (params) {
  return request('post', '/patch/edit/save/patch', params )
}
//获取补丁信息
export function getPatchDetail (params) {
  return request('post', '/patch/detail/info', params )
}
//补丁关联的附件列表
export function getPatchEntityList (params) {
  return request('post', '/patch/attachment/getPatchAssociatedAttachmentsPage', params )
}
//补丁关联的端口列表
export function getPatchPortList (params) {
  return request('post', '/patch/detail/patch/map/port', params )
}
//补丁关联的服务列表
export function getPatchServerList (params) {
  return request('post', '/patch/detail/patch/map/server', params )
}
//补丁关联的漏洞列表
export function getPatchBugList (params) {
  return request('post', '/patch/detail/patch/map/vul', params )
}
//补丁关联的前置补丁列表
export function getPrePatchList (params) {
  return request('post', '/patch/detail/pre/patch', params )
}
//模糊查询补丁
export function getfilterPatch (params) {
  return request('post', '/patch/edit/filter/pre/patch', params )
}
//模糊查询品类型号
export function getCpeUriByFuzzyQueryPage (params) {
  return request('post', '/patch/attachment/getCpeUriByFuzzyQueryPage', params )
}
//新增补丁关联附件
export function insertPatchAttachment (params) {
  return request('post', '/patch/attachment/insert', params )
}
//删除补丁关联附件
export function deletePatchAttachment (params) {
  return request('post', '/patch/attachment/deleteByPrimaryKeys', params )
}
//全量获取品类型号
export function patchHardsoftlib (params) {
  return request('post', '/hardsoftlib/query/all', params )
}
//查询补丁是否存在
export function checkPatch (params) {
  return request('post', '/patch/detail/alive', params )
}