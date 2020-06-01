import React, { Component } from 'react'
import { connect } from 'dva'
import { CommonForm } from '@c/index'
import { Form, Button } from 'antd'
import './index.less'
import { analysisUrl, generateRules } from '@u/common'
import { getServeBaseInfo, getServeRelateSoft, serveAddSoft, serveDelSoft, serveDelPort, serveAddPort, getServeRelatePort, serveDelServe, serveAddServe, getServeRelateServe, getServeRelateProtocol, serveAddProtocol, serveDelProtocol, getServeRestrictedSoft, serveAddRestrictedSoft, serveDelRestrictedSoft } from '@services/assetServices'
import { withRouter } from 'umi'
import Tabs from '../common/Tabs'
const { Item } = Form
// 当前页面公共参数
@withRouter
@Form.create()
class Register extends Component {
  constructor (props){
    super(props)
    const { isEdit } = props
    const urlParam =  analysisUrl(props.location.search)
    const excludeId = urlParam.serveId
    this.state = {
      showWithComponent: isEdit || false,
      serveId: urlParam.serveId,
      serveInfo: {}
    }
    const paramsConfig = { sourceType: 'serviceDepend', excludeId }
    // 依赖该服务的软件内部的封装请求
    this.softwareQueryConfig = {
      params: { ...paramsConfig, sourceType: 'supplyService' },
      getList: (params)=> {  //此函数提换成 获取软件的硬件列表actions
        const { serveId } = this.state
        return getServeRelateSoft({ ...params, businessId: serveId })
      },
      delFunc: (params)=> {  //此函数提换成 删除软件的关联硬件actions
        const { serveId } = this.state
        return serveDelSoft({ ...params, softId: params.id, serviceId: serveId })
      },
      addFunc: (params)=> {  //此函数提换成 添加软件的关联硬件actions
        const { serveId } = this.state
        return serveAddSoft({ ...params, softIdList: params.keys, serviceId: serveId })
      }
    }
    // 关联端口组件内部的封装请求
    this.portQueryConfig = {
      params: paramsConfig,
      getList: (params)=> {  //此函数提换成 获取软件的硬件列表actions
        const { serveId } = this.state
        return getServeRelatePort({ ...params, businessId: serveId })
      },
      delFunc: (params)=> {  //此函数提换成 删除软件的关联硬件actions
        const { serveId } = this.state
        return serveDelPort({ ...params, port: params.id, serviceId: serveId })
      },
      addFunc: (params)=> {  //此函数提换成 添加软件的关联硬件actions
        const { serveId } = this.state
        return serveAddPort({ ...params, portList: params.keys, serviceId: serveId })
      }
    }
    // 关联服务组件内部的封装请求
    this.serveQueryConfig = {
      params: { ...paramsConfig },
      getList: (params)=> {  //此函数提换成 获取软件的硬件列表actions
        const { serveId } = this.state
        return getServeRelateServe({ ...params, excludeId: void 0, serviceBusinessId: void 0, sourceType: void 0, businessId: serveId })
      },
      delFunc: (params)=> {  //此函数提换成 删除软件的关联硬件actions
        const { serveId } = this.state
        return serveDelServe({ ...params, dependService: params.id, serviceId: serveId, id: void 0 })
      },
      addFunc: (params)=> {  //此函数提换成 添加软件的关联硬件actions
        const { serveId } = this.state
        return serveAddServe({ ...params, dependServiceIds: params.keys, serviceId: serveId })
      }
    }
    // 关联协议组件内部的封装请求
    this.protocolQueryConfig = {
      params: { ...paramsConfig, sourceType: 'service' },
      getList: (params)=> {  //此函数提换成 获取软件的硬件列表actions
        const { serveId } = this.state
        return getServeRelateProtocol({ ...params, businessId: serveId })
      },
      delFunc: (params)=> {  //此函数提换成 删除软件的关联硬件actions
        const { serveId } = this.state
        return serveDelProtocol({ ...params, serviceId: serveId, protocolId: params.id, id: void 0, excludeId: void 0, sourceType: void 0 })
      },
      addFunc: (params)=> {  //此函数提换成 添加软件的关联硬件actions
        const { serveId } = this.state
        return serveAddProtocol({ ...params, protocolIdList: params.keys, serviceId: serveId })
      }
    }
    // 提供该服务的软件内部的封装请求
    this.restrictedSoftserveQueryConfig = {
      params: { ...paramsConfig, sourceType: 'dependService' },
      getList: (params)=> {  //此函数提换成 获取依赖的软件actions
        const { serveId } = this.state
        return getServeRestrictedSoft({ ...params, businessId: serveId })
      },
      delFunc: (params)=> {  //此函数提换成 删除依赖的软件actions
        const { serveId } = this.state
        const vodiObj = { id: void 0, excludeId: void 0, sourceType: void 0 }
        return serveDelRestrictedSoft({ ...params, softId: params.id, serviceId: serveId, ...vodiObj })
      },
      addFunc: (params)=> {  //此函数提换成 添加依赖的软件actions
        const { serveId } = this.state
        const vodiObj = { keys: void (0), id: void 0, excludeId: void 0, sourceType: void 0 }
        return serveAddRestrictedSoft({ ...params, softIdList: params.keys, serviceId: serveId, ...vodiObj })
      }
    }
  }
  componentDidMount () {
    const { showWithComponent } = this.state
    const { dispatch } = this.props
    dispatch({ type: 'assetServices/getServiceTypes' })
    if(showWithComponent){
      const { serveId } = this.state
      this.getServeBaseInfo(serveId)
    }
  }
  formHandleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.serveRegister(values)
      }
    })
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
  /**
   * 编辑时，回显值
   * */
  setValues = (fields = [], data = {}) => {
    const { showWithComponent } = this.state
    if(!showWithComponent){
      return fields
    }
    if(!Object.keys(data).length){
      return fields
    }
    // 编辑时把id放入from里面
    const id = [{ type: 'hidden', key: 'stringId' }, { type: 'hidden', key: 'businessId' }]
    return fields.concat(id).map((e)=>({ ...e, defaultValue: data[e.key] }))
  }
  //获取服务基本信息
  getServeBaseInfo = (businessId) => {
    getServeBaseInfo({ businessId }).then((res)=>{
      this.setState({ serveInfo: res.body || {} })
    })
  }
  render () {
    const { showWithComponent, serveInfo } = this.state
    const { serveTypes } = this.props
    let formFields = [
      { name: '服务名', key: 'service', placeholder: '请输入服务名', type: 'input', rules: [{ required: true,  message: '请输入服务名' },  ...generateRules(128)] },
      { name: '显示名', key: 'displayName', placeholder: '请输入显示名', type: 'input', rules: [{ required: true,  message: '请输入显示名' },  ...generateRules(128)] },
      { name: '服务类型', key: 'serviceClasses', data: serveTypes, placeholder: '请选择服务类型', type: 'select', config: { value: 'businessId' }, rules: [{ required: true,  message: '请选择服务类型' } ] }
      // { name: '启动参数', key: 'startupParameter', placeholder: '请输入启动参数', type: 'input', rules: [ ...generateRules(300)] }
      // { name: '描述', placeholder: '请输入描述', key: 'describ', type: 'textArea', rules: [ ...generateRules(1024)] }
    ]
    let describformFields = [
      { name: '描述', placeholder: '请输入描述', rows: 3, key: 'describ', type: 'textArea', rules: [ ...generateRules(300)] }
    ]
    let startupParameterformFields = [
      { name: '启动参数', key: 'startupParameter', placeholder: '请输入启动参数', type: 'input', rules: [ ...generateRules(300)] }

    ]
    formFields = this.setValues(formFields, serveInfo)
    describformFields = this.setValues(describformFields, serveInfo)
    const formLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 18
      }
    }
    const describFormLayout = {
      labelCol: {
        span: 2
      },
      wrapperCol: {
        span: 22
      }
    }
    return (
      <div className="main-detail-content serve-register">
        <div className="detail-title">服务信息</div>
        <div className="detail-fields detail-separate">
          <CommonForm fields={ formFields } column={ 3 } form={ this.props.form } FormItem={ Item } formLayout={ formLayout }/>
          <div className="clear-both">{/**站位，清除浮动*/}</div>
          <CommonForm fields={ startupParameterformFields } column={ 1 } form={ this.props.form } FormItem={ Item } formLayout={ describFormLayout }/>
          <div className="clear-both">{/**站位，清除浮动*/}</div>
          <CommonForm fields={ describformFields } column={ 1 } form={ this.props.form } FormItem={ Item } formLayout={ describFormLayout }/>
          <div className="button-center">
            <Button type="primary" onClick={ this.formHandleSubmit }>保存</Button>
          </div>
        </div>
        {
          showWithComponent &&  <Tabs />
        }
      </div>
    )
  }
}

export default connect(({ assetServices })=>({ serveTypes: assetServices.serveTypes.map(e=>({ ...e, value: e.businessId })) }))(Register)
