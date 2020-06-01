import { Tabs  } from 'antd'
import { RelatePort_new } from '@c/index'
import PrevPatchDetailAndChange from '@c/BugPatch/PrevPatchDetailAndChange'
import ServiceDetailAndChange from '@c/BugPatch/ServiceDetailAndChange'
import AppendixDetailAndChange from '@c/BugPatch/AppendixDetailAndChange'
import RelevanceBugDetailAndChange from '@c/BugPatch/RelevanceBugDetailAndChange'
import api from '@/services/api'

const TabPane = Tabs.TabPane
export default ({ props }) => {
  const { type, from, id } = props
  // 关联端口组件内部的封装请求
  const portQueryConfig = {
    getList: (params) => {
      return api.getPatchPortList({ ...params, antiyPatchNumber: id })
    },
    delFunc: (params) => {
      return api.deletePatchPort({ ...params, toBeOperatedIds: [params.record.stringId], patchIds: id })
    },
    addFunc: (params) => {
      console.log(params)
      params.ports = JSON.parse(JSON.stringify(params.keys))
      delete params.keys
      return api.addPatchPort({ ...params, ports: params.ports, patchIds: id })
    }
  }
  return (
    <Tabs defaultActiveKey={'1'} style={{ margin: '20px 0px' }}>
      <TabPane tab="前置补丁" key="1">
        <PrevPatchDetailAndChange type={type} />
      </TabPane>
      <TabPane tab="关联附件信息" key="2">
        <AppendixDetailAndChange type={type} />
      </TabPane>
      <TabPane tab="关联服务信息" key="3">
        <ServiceDetailAndChange type={type} from={from} />
      </TabPane>
      <TabPane tab="关联端口信息" key="4">
        <RelatePort_new disabledOperation={type !== 'change'} queryConfig={ portQueryConfig }/>
      </TabPane>
      <TabPane tab="关联漏洞信息" key="5">
        <RelevanceBugDetailAndChange type={type} />
      </TabPane>
    </Tabs>
  )
}
