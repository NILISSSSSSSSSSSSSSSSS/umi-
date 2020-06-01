import request from '@u/request'

//软硬件列表查询
const soHardwareList = param=> request('post', '/hardsoftlib/query/list', param)

//软硬件入库
const soHardwareStorage = param=> request('post', '/hardsoftlib/batch/storage', param)

//软硬件删除
const soHardwareDel = param=> request('post', '/hardsoftlib/batch/delete', param)

//软硬件详情上半部分
const soHardwareDetail = param=> request('post', '/hardsoftlib/query/id', param)

//添加软硬件组件列表
const sohardwareAddCompList = param=> request('post', '/assemblylib/query/list', param)

//检查数据还是否存在
const checkExist = param=> request('post', '/hardsoftlib/checkExist', param)

//导入

export default{
  soHardwareList,
  soHardwareStorage,
  soHardwareDel,
  soHardwareDetail,
  sohardwareAddCompList,
  checkExist
}