import request from '@u/request'

//硬件详情列表查询
// const hardwareDetail = param=> request('post', '/hardassemblyrelation/query/list', param)

//查询硬件资产对应的组件table
const hardwareDetailList = param=> request('post', '/hardassemblyrelation/query/assemblyLibList', param)

//硬件详情删除
const hardwareDetaliDel = param=> request('post', '/hardassemblyrelation/delete/businessId', param)

//硬件关系组件保存
const hardwareSave = param=> request('post', '/hardassemblyrelation/save/relation', param)

export default{
  // hardwareDetail,
  hardwareDetailList,
  hardwareDetaliDel,
  hardwareSave

}