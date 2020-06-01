import request from '@u/request'

//协议管理列表查询
const protocolQueryList = param=> request('post', '/protocol/query/list', param)
//协议管理通过id查询
const protocolQueryId = param=> request('post', '/protocol/query/id', param)
//通过id删除协议
const protocolDeleteId = param=> request('post', '/protocol/delete/id', param)
//登记协议保存
const protocolSaveSingle = param=> request('post', '/protocol/save/single', param)
//协议入库
const protocolStorage = param=> request('post', '/protocol/storage', param)
//编辑协议
const protocolUpdateSingle = param=> request('post', '/protocol/update/single', param)
//协议关联的服务列表
const getProtocolService = param=> request('post', '/protocol/query/relationService', param)
//协议关联的软件列表
const getProtocolSoft = param=> request('post', '/protocol/query/relationSoft', param)
//删除依赖服务
const deleteProtocolService = param=> request('post', '/protocol/delete/serviceRelation', param)
//删除关联软件
const deleteProtocolSoft = param=> request('post', '/protocol/delete/softRelation', param)

//添加依赖服务
const addProtocolService = param=> request('post', '/protocol/save/serviceRelation', param)
//添加关联软件
const addProtocolSoft = param=> request('post', '/protocol/save/softRelation', param)
//判断是否有这条数据
const queryStatus = param=> request('post', '/protocol/queryStatus/id', param)

export default {
  protocolQueryList,
  protocolQueryId,
  protocolDeleteId,
  protocolSaveSingle,
  protocolStorage,
  protocolUpdateSingle,
  getProtocolService,
  getProtocolSoft,
  deleteProtocolService,
  deleteProtocolSoft,
  addProtocolService,
  addProtocolSoft,
  queryStatus
}