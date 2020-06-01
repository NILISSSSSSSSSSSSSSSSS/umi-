import { Tabs  } from 'antd'
import { RelatePort_new } from '@c/index'
import LinkDetailAndChange from '@c/BugPatch/LinkDetailAndChange'
import ServiceDetailAndChange from '@c/BugPatch/ServiceDetailAndChange'
import PlanDetailAndChange from '@c/BugPatch/PlanDetailAndChange'
import CatgoryDetailAndChange from '@c/BugPatch/CatgoryDetailAndChange'
import api from '@/services/api'

const TabPane = Tabs.TabPane
export default ({ props }) => {
  //page:正式库或临时库,type:编辑页或详情页,from:漏洞或补丁,id:url上的ID参数
  const { page, type, from, id } = props
  // 关联端口组件内部的封装请求
  const portQueryConfig = {
    getList: (params) => {
      return api.getBugPortList({ ...params, antiyVulnId: id })
    },
    delFunc: (params) => {
      return api.deleteBugPort({ ...params, ids: [params.record.stringId], antiyVulnId: id })
    },
    addFunc: (params) => {
      const ports = params.keys.map(item => {
        return {
          port: item
        }
      })
      return api.addBugPort({ ...params, ports, antiyVulnId: id })
    }
  }
  return (
    <div id="bug-tabs">
      <Tabs defaultActiveKey={'1'} style={{ margin: '20px 0px' }}>
        <TabPane tab="参考链接" key="1">
          <LinkDetailAndChange type={type} page={page} />
        </TabPane>
        <TabPane tab="漏洞影响服务" key="2">
          <ServiceDetailAndChange type={type} from={from} />
        </TabPane>
        <TabPane tab="漏洞影响端口" key="3">
          <RelatePort_new disabledOperation={type !== 'change'} queryConfig={ portQueryConfig }/>
        </TabPane>
        <TabPane tab="漏洞解决方案" key="4">
          <PlanDetailAndChange type={type} />
        </TabPane>
        <TabPane tab="漏洞影响品类型号" key="5">
          <CatgoryDetailAndChange type={type} page={page} />
        </TabPane>
      </Tabs>
    </div>
  )
}
