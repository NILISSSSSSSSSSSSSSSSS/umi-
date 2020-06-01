import React, { Component } from 'react'
import { Form, Tabs } from 'antd'
import { DetailFiedls, RelateSoftware, RelateHard } from '@c/index'
import { analysisUrl } from '@u/common'
import { LANGUAGE } from '@a/js/enume'
import { getPartBaseInfo, getPartRelateHard, getPartRelateSoft } from '@services/parts'
import './index.less'
import { withRouter } from 'umi'
const TabPane = Tabs.TabPane
@withRouter
@Form.create()
class PartDetail extends Component {
  constructor (props){
    super(props)
    const urlParam =  analysisUrl(props.location.search)
    this.state = {
      partId: urlParam.partId,
      baseInfo: {}
    }
  }
  componentDidMount () {
    const { partId } = this.state
    this.getPartBaseInfo( partId )
  }

  /**
   * 获取组件的基本信息
   * @param primary 组件的ID
   */
  getPartBaseInfo = (primary) => {
    getPartBaseInfo({ primaryKey: primary }).then((res)=>{
      this.setState({ baseInfo: res.body || {} })
    })
  }
  // 关联硬件组件内部的封装请求
  hardQueryConfig = {
    getList: (params) => {  //此函数提换成 获取组件的硬件列表actions
      const { partId } = this.state
      return getPartRelateHard({ ...params, assemblyId: partId })
    }
  }
  // 关联软件组件内部的封装请求
  softwareQueryConfig = {
    getList: (params)=> {  //此函数提换成 获取软件的硬件列表actions
      const { partId } = this.state
      return getPartRelateSoft({ ...params, assemblyId: partId })
    }
  }
  render () {
    const { baseInfo } = this.state
    const fields = [
      { key: 'supplier', name: '厂商' },
      { key: 'productName', name: '名称' },
      { key: 'version', name: '版本' },
      { key: 'sysVersion', name: '系统版本' },
      { key: 'language', name: '语言' },
      { key: 'other', name: '其它' }
    ]
    return (
      <div className="main-detail-content parts-detail">
        <div className="detail-title">组件信息</div>
        <div className="detail-fields detail-separate">
          <DetailFiedls fields={fields} data={baseInfo}/>
        </div>
        <Tabs>
          <TabPane key="0" tab="组件关联的硬件">
            <RelateHard disabledOperation queryConfig={this.hardQueryConfig}/>
          </TabPane>
          <TabPane key="1" tab="组件关联的软件">
            <RelateSoftware disabledOperation queryConfig={this.softwareQueryConfig}/>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}

export default PartDetail
