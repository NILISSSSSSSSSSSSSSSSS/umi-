import React, { Component } from 'react'
import { Tabs } from 'antd'
import { DetailFiedls, RelateSoftware, RelateHard } from '@c/index'
import { analysisUrl } from '@u/common'
import {
  partAddHard,
  partDelHard,
  getPartRelateHard,
  getPartRelateSoft,
  partAddSoft,
  partDelSoft,
  getPartBaseInfo
} from '@services/parts'
import { withRouter } from 'umi'
import './index.less'
const TabPane = Tabs.TabPane

@withRouter
class PartRegister extends Component {
  constructor (props) {
    super(props)
    const urlParam = analysisUrl(props.location.search)
    const { isEdit } = props
    const excludeId = urlParam.partId
    this.state = {
      showWithComponent: isEdit || false,
      partId: urlParam.partId,
      partInfo: {}
    }
    const paramsConfig = { sourceType: 'assembly', excludeId }
    // 关联硬件组件内部的封装请求
    this.hardQueryConfig = {
      params: paramsConfig,
      getList: (params) => {  //此函数提换成 获取组件的硬件列表actions
        const { partId } = this.state
        return getPartRelateHard({ ...params, assemblyId: partId })
      },
      delFunc: (params) => {  //此函数提换成 删除组件的关联硬件actions
        const { partId } = this.state
        return partDelHard({ ...params, assemblyId: partId, businessIdList: [ params.id ] })
      },
      addFunc: (params) => {  //此函数提换成 添加组件的关联硬件actions
        const { partId } = this.state
        return partAddHard({ ...params, assemblyId: partId, businessIdList: params.keys })
      }
    }
    // 关联软件组件内部的封装请求
    this.softwareQueryConfig = {
      params: paramsConfig,
      getList: (params) => {  //此函数提换成 获取软件的硬件列表actions
        const { partId } = this.state
        return getPartRelateSoft({ ...params, assemblyId: partId })
      },
      delFunc: (params) => {  //此函数提换成 删除软件的关联硬件actions
        const { partId } = this.state
        const { id } = params
        return partDelSoft({ ...params, businessIdList: [id], assemblyId: partId })
      },
      addFunc: (params) => {  //此函数提换成 添加软件的关联硬件actions
        const { partId } = this.state
        const { keys } = params
        return partAddSoft({ ...params, businessIdList: keys, assemblyId: partId })
      }
    }
  }

  componentDidMount () {
    const { partId } = this.state
    this.getPartBaseInfo(partId)
  }

  /**
   * 获取组件的基本信息
   * @param primary 组件的ID
   */
  getPartBaseInfo = (primary) => {
    getPartBaseInfo({ primaryKey: primary }).then((res)=>{
      this.setState({ partInfo: res.body || {} })
    })
  }
  // 保存基本信息
  formHandleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if(!err) {
        this.serveRegister(values)
      }
    })
  }
  /**
   * 注册、编辑提交
   * @param values
   */
  serveRegister = (values) => {
    const { onSubmit } = this.props
    onSubmit && onSubmit(values)
  }
  /**
   * 编辑时，回显值
   * */
  setValues = (fields = [], data = {}) => {
    const keys = Object.keys(data)
    const { showWithComponent } = this.state
    if(!showWithComponent) {
      return fields
    }
    // 编辑时把id放入from里面
    const id = [{ type: 'hidden', key: 'stringId' }, { type: 'hidden', key: 'businessId' }]
    // 没有拿到详情数据时，不进行设置值
    if(!keys.length){
      return fields
    }
    return fields.concat(id).map((e) => ({ ...e, defaultValue: data[ e.key ] }))
  }
  render () {
    const { partInfo, showWithComponent, partId } = this.state
    const fields = [
      { key: 'supplier', name: '厂商' },
      { key: 'productName', name: '名称' },
      { key: 'version', name: '版本' },
      { key: 'sysVersion', name: '系统版本' },
      { key: 'language', name: '语言' },
      { key: 'other', name: '其它' }
    ]
    return (
      <div className="main-detail-content parts-register">
        <div className="detail-title">组件信息</div>
        <div className="detail-fields detail-separate">
          <DetailFiedls fields={fields} data={partInfo}/>
          <div className="clear-both">{/**站位，清除浮动*/ }</div>
        </div>
        {
          showWithComponent && <Tabs>
            <TabPane key="0" tab="组件关联的硬件">
              <RelateHard queryConfig={ this.hardQueryConfig }/>
            </TabPane>
            <TabPane key="1" tab="组件关联的软件">
              <RelateSoftware queryConfig={ this.softwareQueryConfig }/>
            </TabPane>
          </Tabs>
        }

      </div>
    )
  }
}
export default PartRegister
