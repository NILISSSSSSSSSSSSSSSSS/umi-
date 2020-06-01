import React, { Component, Fragment } from 'react'
import { RelateSoftware, RelateServe, RelateProtocol, RelatePort_new, RestrictedSoft } from '@c/index'
import { Tabs } from 'antd'
import { withRouter } from 'umi'
import './index.less'
import { analysisUrl } from '@u/common'
import { getServeBaseInfo, getServeRelateSoft, serveAddSoft, serveDelSoft, serveDelPort,  serveAddPort, getServeRelatePort, serveDelServe, serveAddServe, getServeRelateServe, getServeRelateProtocol, serveAddProtocol, serveDelProtocol, getServeRestrictedSoft, serveAddRestrictedSoft, serveDelRestrictedSoft } from '@services/assetServices'

const TabPane = Tabs.TabPane
@withRouter
class CustomTabs extends Component {
  constructor (props) {
    super(props)
    const urlParam = analysisUrl(props.location.search)
    const excludeId = urlParam.serveId
    this.state = {
      serveId: urlParam.serveId,
      serveInfo: {}
    }
    const paramsConfig = { sourceType: 'dependService', excludeId }
    // 依赖该服务的软件内部的封装请求
    this.softwareQueryConfig = {
      params: { ...paramsConfig },
      getList: (params) => {  //此函数提换成 获取软件的硬件列表actions
        const { serveId } = this.state
        return getServeRelateSoft({ ...params, businessId: serveId })
      },
      delFunc: (params) => {  //此函数提换成 删除软件的关联硬件actions
        const { serveId } = this.state
        return serveDelSoft({ ...params, softId: params.id, serviceId: serveId })
      },
      addFunc: (params) => {  //此函数提换成 添加软件的关联硬件actions
        const { serveId } = this.state
        return serveAddSoft({ ...params, softIdList: params.keys, serviceId: serveId })
      }
    }
    // 关联端口组件内部的封装请求
    this.portQueryConfig = {
      params: paramsConfig,
      getList: (params) => {  //此函数提换成 获取软件的硬件列表actions
        const { serveId } = this.state
        return getServeRelatePort({ ...params, businessId: serveId })
      },
      delFunc: (params) => {  //此函数提换成 删除软件的关联硬件actions
        const { serveId } = this.state
        return serveDelPort({ ...params, port: params.id, serviceId: serveId })
      },
      addFunc: (params) => {  //此函数提换成 添加软件的关联硬件actions
        const { serveId } = this.state
        return serveAddPort({ ...params, portList: params.keys, serviceId: serveId })
      }
    }
    // 关联服务组件内部的封装请求
    this.serveQueryConfig = {
      params: { ...paramsConfig },
      getList: (params) => {  //此函数提换成 获取软件的硬件列表actions
        const { serveId } = this.state
        return getServeRelateServe({
          ...params,
          excludeId: void 0,
          serviceBusinessId: void 0,
          sourceType: void 0,
          businessId: serveId
        })
      },
      delFunc: (params) => {  //此函数提换成 删除软件的关联硬件actions
        const { serveId } = this.state
        return serveDelServe({ ...params, dependService: params.id, serviceId: serveId, id: void 0 })
      },
      addFunc: (params) => {  //此函数提换成 添加软件的关联硬件actions
        const { serveId } = this.state
        return serveAddServe({ ...params, dependServiceIds: params.keys, serviceId: serveId })
      }
    }
    // 关联协议组件内部的封装请求
    this.protocolQueryConfig = {
      params: { ...paramsConfig, sourceType: 'service' },
      getList: (params) => {  //此函数提换成 获取软件的硬件列表actions
        const { serveId } = this.state
        return getServeRelateProtocol({ ...params, businessId: serveId })
      },
      delFunc: (params) => {  //此函数提换成 删除软件的关联硬件actions
        const { serveId } = this.state
        return serveDelProtocol({
          ...params,
          serviceId: serveId,
          protocolId: params.id,
          id: void 0,
          excludeId: void 0,
          sourceType: void 0
        })
      },
      addFunc: (params) => {  //此函数提换成 添加软件的关联硬件actions
        const { serveId } = this.state
        return serveAddProtocol({ ...params, protocolIdList: params.keys, serviceId: serveId })
      }
    }
    // 提供该服务的软件内部的封装请求
    this.restrictedSoftserveQueryConfig = {
      params: { ...paramsConfig, sourceType: 'supplyService' },
      getList: (params) => {  //此函数提换成 获取依赖的软件actions
        const { serveId } = this.state
        return getServeRestrictedSoft({ ...params, businessId: serveId })
      },
      delFunc: (params) => {  //此函数提换成 删除依赖的软件actions
        const { serveId } = this.state
        const vodiObj = { id: void 0, excludeId: void 0, sourceType: void 0 }
        return serveDelRestrictedSoft({ ...params, softId: params.id, serviceId: serveId, ...vodiObj })
      },
      addFunc: (params) => {  //此函数提换成 添加依赖的软件actions
        const { serveId } = this.state
        const vodiObj = { keys: void (0), id: void 0, excludeId: void 0, sourceType: void 0 }
        return serveAddRestrictedSoft({ ...params, softIdList: params.keys, serviceId: serveId, ...vodiObj })
      }
    }
  }

  componentDidMount () {
    const { showWithComponent } = this.state
    if(showWithComponent) {
      const { serveId } = this.state
      this.getServeBaseInfo(serveId)
    }
  }

  /**
   * 显示关联信息，如果登记时，必须提交基础信息之后才会显示关联信息
   */
  showWithInfo = () => {
    this.setState({ showWithComponent: true })
  }
  /**
   * 注册、编辑提交
   * @param values
   */
  serveRegister = (values) => {
    const { onSubmit } = this.props
    onSubmit && onSubmit(values, this.showWithInfo)
  }
  //获取服务基本信息
  getServeBaseInfo = (businessId) => {
    getServeBaseInfo({ businessId }).then((res) => {
      this.setState({ serveInfo: res.body || {} })
    })
  }

  render () {
    const { showWithComponent } = this.state
    const { disabledOperation } = this.props
    return (
      <Fragment>
        <Tabs>
          <TabPane key="0" tab="提供该服务的软件">
            <RestrictedSoft disabledOperation={ disabledOperation } queryConfig={ this.restrictedSoftserveQueryConfig }/>
          </TabPane>
          <TabPane key="1" tab="服务依赖的端口">
            <RelatePort_new disabledOperation={ disabledOperation } queryConfig={ this.portQueryConfig }/>
          </TabPane>
          <TabPane key="2" tab="服务依赖的服务">
            <RelateServe disabledOperation={ disabledOperation } queryConfig={ this.serveQueryConfig }/>
          </TabPane>
          <TabPane key="3" tab="服务依赖的协议">
            <RelateProtocol disabledOperation={ disabledOperation } queryConfig={ this.protocolQueryConfig }/>
          </TabPane>
          <TabPane key="4" tab="依赖该服务的软件">
            <RelateSoftware disabledOperation={ disabledOperation } queryConfig={ this.softwareQueryConfig }/>
          </TabPane>
        </Tabs>
      </Fragment>

    )
  }
}
export default CustomTabs
