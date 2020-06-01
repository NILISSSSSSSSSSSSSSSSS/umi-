import request from '@u/request'

//软件详情列表查询
// const softwareList = param=> request('post', '/assemblysoftrelation/query/assemblyLibList', param)

//

//查询软件资产对应的组件列表
const softwareDetailListComp = param=> request('post', '/assemblysoftrelation/query/assemblyLibList', param)

//软件关联组件删除
const softwareDelComp = param=> request('post', '/assemblysoftrelation/delete/businessId', param)
//软件关联组件保存
const softwareSaveComp = param=> request('post', '/assemblysoftrelation/save/realtion', param)

//

//查询软件资产依赖的端口列表
const softwareDetailListPort = param=> request('post', '/softportrelation/query/portList', param)
//添加依赖的端口列表
// const softwareAddListPort = param=> request('post', '/softportrelation/query/list', param)
//软件依赖的端口删除
const softwareDelPort = param=> request('post', '/softportrelation/delete/businessId', param)
//软件依赖的端口保存
const softwareSavePort = param=> request('post', '/softportrelation/save/relation', param)
//

//查询软件资产依赖的服务列表
const softwareDetailListLation = param=> request('post', '/softservicerelation/query/dependServiceList', param)
//添加依赖的服务列表
const softwareAddListLation = param=> request('get', '/sysservicelib/query/list', param)
//软件依赖的服务删除
const softwareDelLation = param=> request('post', '/softservicerelation/delete/businessId', param)
//软件依赖的服务保存
const softwareSaveLation = param=> request('post', '/softservicerelation/save/relation', param)
//

//查询软件资产对应的依赖的协议列表
const softwareDetailListProtocol = param=> request('post', '/softprotocolrelation/query/dependServiceList', param)
//添加依赖的协议列表
const softwareAddListProtocol = param=> request('get', '/protocol/query/list', param)
//软件依赖的协议删除
const softwareDelProtocol = param=> request('post', '/softprotocolrelation/delete/businessId', param)
//软件依赖的协议保存
const softwareSaveProtocol = param=> request('post', '/softprotocolrelation/save/relation', param)
//

//查询软件资产提供的服务列表
const softwareDetailListLib = param=> request('post', '/softservicelib/query/supplyServiceList', param)
//添加提供的服务列表
//同添加依赖的服务列表

//软件关联提供的服务删除
const softwareDelLib = param=> request('post', '/softservicelib/delete/businessId', param)
//软件关联提供的服务保存
const softwareSaveLib = param=> request('post', '/softservicelib/save/relation', param)

export default{
  // softwareList,
  softwareDetailListComp,
  softwareDelComp,
  softwareSaveComp,
  softwareDetailListPort,
  softwareDelPort,
  softwareSavePort,
  softwareDetailListLation,
  softwareAddListLation,
  softwareDelLation,
  softwareSaveLation,
  softwareDetailListProtocol,
  softwareAddListProtocol,
  softwareDelProtocol,
  softwareSaveProtocol,
  softwareDetailListLib,
  softwareDelLib,
  softwareSaveLib

}