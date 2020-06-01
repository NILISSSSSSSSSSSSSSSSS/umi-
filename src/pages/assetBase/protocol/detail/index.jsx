import { PureComponent } from 'react'
import { Row, Col, Tabs } from 'antd'
import { RelateSoftware, RelateServe } from '@c/index'
import api from '@/services/api'
import { analysisUrl } from '@u/common'

const { TabPane } = Tabs
class ProtocolDetail extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tabActiveKey: '1',
      protocolData: {},
      businessId: analysisUrl(this.props.location.search).stringId
    }
  }
  componentDidMount (){
    api.protocolQueryId({ businessId: analysisUrl(this.props.location.search).stringId }).then(response => {
      this.setState({
        protocolData: response.data.body
      })
    })
  }
  render (){
    let { tabActiveKey, protocolData } = this.state
    const blockSpan = { xxl: 24, xl: 24 }
    return(
      <div className="main-detail-content">
        <p className="detail-title">协议信息</p>
        <div className="detail-content detail-content-layout">
          <Row>
            <Col {...blockSpan}><span className="detail-content-label">协议名称：</span>{protocolData.name}</Col>
            <Col {...blockSpan}><span className="detail-content-label">关联漏洞：</span>{(protocolData.linkedVuls || []).join('，')}</Col>
            <Col {...blockSpan}><span className="detail-content-label">备注：</span>{protocolData.memo}</Col>
          </Row>
        </div>
        {/* 列表 */}
        <div className="table-wrap">
          <Tabs activeKey={tabActiveKey} onChange={this.tabChange}>
            <TabPane tab="依赖该协议的软件" key='1' forceRender>
              <RelateSoftware disabledOperation queryConfig={this.softwareQueryConfig}/>
            </TabPane>
            <TabPane tab="依赖该协议的服务" key='2' forceRender >
              <RelateServe disabledOperation queryConfig={this.serveQueryConfig}/>
            </TabPane>
          </Tabs>
        </div>
      </div>
    )
  }
  tabChange = (key) => {
    this.setState({
      tabActiveKey: key
    })
  }
  // 关联软件组件内部的封装请求
  softwareQueryConfig = {
    getList: (params)=> {  //此函数提换成 获取软件的硬件列表actions
      let { businessId } = this.state
      return api.getProtocolSoft({ ...params, businessId })
    }
  }
  // 关联服务组件内部的封装请求
  serveQueryConfig = {
    getList: (params)=> {  //此函数提换成 获取组件的服务列表actions
      let { businessId } = this.state
      return api.getProtocolService({ ...params, businessId })
    }
  }
}
export default ProtocolDetail
