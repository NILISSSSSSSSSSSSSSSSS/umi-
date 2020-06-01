import React, { Component } from 'react'
import { DetailFiedls } from '@c/index'  //引入方式
import { analysisUrl } from '@u/common'
import { getServeBaseInfo } from '@services/assetServices'
import './index.less'
import Tabs from '../common/Tabs'

export default class ServeDetail extends Component{
  constructor (props){
    super(props)
    const urlParam =  analysisUrl(props.location.search)
    this.state = {
      serveId: urlParam.serveId,
      serveInfo: {}
    }
  }
  componentDidMount () {
    const { serveId } = this.state
    this.getServeBaseInfo(serveId)
  }
  //获取服务基本信息
  getServeBaseInfo = (businessId) => {
    getServeBaseInfo({ businessId }).then((res)=>{
      this.setState({ serveInfo: res.body || {} })
    })
  }
  render () {
    const { serveInfo } = this.state
    const fields = [
      { key: 'service', name: '服务名' },
      { key: 'displayName', name: '显示名' },
      { key: 'serviceClassesStr', name: '服务类型' }

    ]
    const oneRowFields = [ { key: 'describ', name: '描述' } ]
    const startupParameterFields = [  { key: 'startupParameter', name: '启动参数' } ]
    return (
      <div className="main-detail-content serve-detail">
        <div className="detail-title">服务信息</div>
        <div className="detail-fields detail-separate">
          <DetailFiedls fields={fields} data={serveInfo}/>
          <DetailFiedls fields={startupParameterFields} column={1} data={serveInfo}/>
          <DetailFiedls fields={oneRowFields} column={1} data={serveInfo}/>
        </div>
        <Tabs disabledOperation/>
      </div>
    )
  }
}
