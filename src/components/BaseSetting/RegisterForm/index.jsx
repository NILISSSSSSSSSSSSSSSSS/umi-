import { Component } from 'react'
// import { Link } from 'dva/router'
import { connect } from 'dva'
import { Form, Row, Input, Select, Col, Button, message } from 'antd'
import { SOURCE_LIST, SOURCE_LEVEL } from '@a/js/enume'
import Footer from '@c/BaseSetting/RegisterFooter'
import api from '@/services/api'
import { debounce } from 'lodash'
import { analysisUrl } from '@u/common'
import { withRouter } from 'dva/router'

const FormItem = Form.Item
const { Option } = Select
const TextArea = Input.TextArea
class SettingRegisterForms extends Component {
  constructor (props) {
    super(props)
    let { stringId } = analysisUrl(this.props.location.search)
    this.state = {
      templateOb: {},
      sourceType: '',
      stringId,
      serveList: this.props.serveList || [], //下拉框中 的枚举数据
      osList: this.props.osList || [],
      serveData: [], //通过id得到
      portData: [],
      osId: '',
      serveArr: [
        { name: '关联服务', key: 'service', type: 'select', multiple: null, search: true, data: [], required: 'serviceStatus', message: '请选择关联服务' },
        { name: '服务状态', key: 'serviceStatus', type: 'select', multiple: null, required: 'service', message: '请选择服务状态', search: false, data: [{ name: '开启', value: 1 }, { name: '关闭', value: 0 }] }],
      serveArr2: [
        { name: '关联端口', key: 'port', type: 'InputNumber', required: 'portStatus', message: '请输入端口' },
        { name: '端口状态', key: 'portStatus', type: 'select', multiple: null, required: 'port', message: '请选择端口状态', search: false, data: [{ name: '开启', value: 1 }, { name: '关闭', value: 0 }] }]
    }
    this.selectOs = debounce(this.selectOs, 800)
  }
  componentDidMount () {
    const { dispatch } = this.props
    dispatch({ type: 'baseSetting/getRelationOs', payload: { productName: '' } })
    let { stringId } = this.state
    if(stringId){
      this.getDetail(stringId)
    }
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.props.osList) !== JSON.stringify(nextProps.osList)) {
      //适用系统
      this.setState({
        osList: nextProps.osList
      })
    }
  }
  render () {
    const { getFieldDecorator } = this.props.form
    let { templateOb, sourceType, stringId, portData, serveData,
      osList, serveArr, serveArr2 } = this.state
    const textAreaList = [
      { name: '描述', key: 'description', required: true, max: 1024 },
      { name: '核查脚本', key: 'checkScript', required: true, max: 5000 },
      { name: '判断依据', key: 'basis', required: false, max: 5000 },
      { name: '加固方案', key: 'fixContent', required: false, max: 1024 },
      { name: '加固脚本', key: 'fixScript', required: false, max: 5000 },
      { name: '建议', key: 'suggest', required: false, max: 1024 },
      { name: '影响', key: 'effect', required: false, max: 1024 },
      { name: '备注', key: 'remark', required: false, max: 512 }
    ]
    return (
      <section className="information-register">
        <div className="main-detail-content">
          <div className="item-info" >
            <Form className="form-page" style={{ overflow: 'hidden', padding: '10px 40px' }}>
              <div className="formItem-title">基础信息</div>
              <div style={{ overflow: 'hidden' }}>
                <Row>
                  <Col span={12}>
                    <FormItem label="名称">
                      {
                        getFieldDecorator('name', {
                          rules: [{ required: true, message: '请输入名称！' }, { whitespace: true, message: '名称不能为空！' }, { message: '最多输入256个字符！', max: 256 }],
                          initialValue: templateOb ? templateOb.name : null
                        })(
                          <Input autoComplete="off" placeholder="请输入"  className="base-form-item" allowClear={true}/>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label='基准来源'>
                      {
                        getFieldDecorator('source', {
                          rules: [{ required: true, message: '请选择基准来源！' }],
                          initialValue: templateOb.source
                        })(
                          <Select
                            className="base-form-item"
                            allowClear={true}
                            disabled={stringId ? true : false}
                            optionFilterProp="children"
                            onChange={ this.sourceChange }
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                            placeholder="请选择" >
                            {
                              SOURCE_LIST.map((item, index) => {
                                return (<Option key={item.value} value={item.value}>{item.name}</Option>)
                              })
                            }
                          </Select>
                        )
                      }
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem label='适用系统'>
                      {
                        getFieldDecorator('os', {
                          rules: [{ required: true, message: '请选择适用系统！' }],
                          initialValue: templateOb.osName
                        })(
                          <Select
                            showSearch
                            className="base-form-item"
                            allowClear={true}
                            optionFilterProp="children"
                            disabled={stringId ? true : false}
                            onSearch={this.selectOs}
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                            placeholder="请选择" >
                            {
                              osList.map((item, index) => {
                                return (<Option key={item.businessId} value={item.businessId}>{item.name}</Option>)
                              })
                            }
                          </Select>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="编号">
                      {
                        getFieldDecorator('ruleId', {
                          rules: [{ required: sourceType === 3 ? false : true, message: '请输入编号！' }, { whitespace: true, message: '编号不能为空！' }, { message: '最多输入100个字符！', max: 100 }],
                          initialValue: templateOb.ruleId
                        })(
                          <Input autoComplete="off"  placeholder="请输入" allowClear={ (stringId || sourceType === 3) ? false : true } className="base-form-item" disabled={(stringId || sourceType === 3) ? true : false}/>
                        )
                      }
                    </FormItem>
                  </Col>
                </Row>
                <Row>
                  <Col span={12}>
                    <FormItem label='安全级别'>
                      {
                        getFieldDecorator('level', {
                          rules: [{ required: false, message: '请选择' }],
                          initialValue: templateOb.level
                        })(
                          <Select
                            className="base-form-item"
                            allowClear={true}
                            optionFilterProp="children"
                            getPopupContainer={triggerNode => triggerNode.parentNode}
                            placeholder="请选择" >
                            {
                              SOURCE_LEVEL.map((item, index) => {
                                return (<Option key={item.value} value={item.value}>{item.name}</Option>)
                              })
                            }
                          </Select>
                        )
                      }
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem label="加固编号">
                      {
                        getFieldDecorator('fixId', {
                          rules: [{ whitespace: true, message: '加固编号不能为空！' }, { message: '最多输入100个字符！', max: 100 }],
                          initialValue: templateOb.fixId
                        })(
                          <Input autoComplete="off" allowClear={(templateOb.source === 3 || sourceType === 3) ? false : true} disabled={ sourceType === 3 || templateOb.source === 3 ? true : false } placeholder="请输入" className="base-form-item"/>
                        )
                      }
                    </FormItem>
                  </Col>
                </Row>
                {textAreaList.map((item, index) => {
                  return <Col span={12} key={index}>
                    <FormItem label={item.name} className="form-page-block">
                      {
                        getFieldDecorator(item.key, {
                          rules: [{ required: item.required, message: '请输入' + item.name }, { whitespace: true, message: item.name + '不能为空！' }, { message: '最多输入' + item.max + '个字符！', max: item.max }],
                          initialValue: templateOb[item.key]
                        })(
                          <TextArea rows={4} placeholder="请输入"  style={{ maxWidth: 'none', width: '310px', resize: 'none' }}/>
                        )
                      }
                    </FormItem>
                    {/* 占位 */}
                    <FormItem></FormItem>
                  </Col>
                })
                }
              </div>
              <Footer
                title='配置服务'
                config={serveArr} //基本配置项
                field={'baselineConfigInfoExt'}
                value={serveData} // 编辑时 使用，内部是已处理好的数据
                form={this.props.form} ></Footer>
              <Footer
                title='配置端口'
                config={serveArr2}
                value={portData}
                field={'baselineConfigInfoExt2'}
                form={this.props.form} ></Footer>
              <div className="button-center">
                <div>
                  <Button type="primary" onClick={this.formHandleSubmit}>保存</Button>
                  {/* <Button type="primary" ghost onClick={this.goBack}>返回</Button> */}
                </div>
              </div>
            </Form>
          </div>
        </div>
      </section>
    )
  }
  selectOs=(value)=>{
    this.props.dispatch({ type: 'baseSetting/getRelationOs', payload: { productName: value } })
  }
  //详情展示
  getDetail = (id)=>{
    api.queryBaseline({ stringId: id }).then(res => {
      this.setState({
        templateOb: res.body,
        serveData: res.body.services,
        portData: res.body.ports,
        osId: res.body.os
      })
    })
  }
  sourceChange = (e) => {
    if(e === 3){
      this.props.form.setFieldsValue({
        fixId: '',
        ruleId: ''
      })
    }
    this.setState({
      sourceType: e
    })
  }
  //保存
  formHandleSubmit = (e)=>{
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // console.log(values)
        this.combination(values)
      }
    })
  }
  //组合动态生成的字段
  combination=(values)=>{
    let arr = Object.keys(values)
    let key1 = [], key2 = []
    let serviceId = JSON.parse(sessionStorage.getItem('service')) || []
    //判断数组中是否有值，没有就新建
    let isArr = (variate, key, index, v)=>{
      if(!variate[index]) variate[index] = {}
      if(key === 'service' && this.state.serveData.length && serviceId[index - 1][v]){
        variate[index][key] = serviceId[index - 1][v]
      }else if(key === 'service' && serviceId[index][v]){
        variate[index][key] = serviceId[index][v]
      }
      else{
        variate[index][key] = v
      }
      return variate
    }
    arr.forEach(key=>{
      let init = key.split('_')
      switch (init[0]) {
        case 'baselineConfigInfoExt':
          if(init[1] !== 'undefined' && values[key] !== undefined && values[key] !== null)
            values.services = isArr(key1, init[1], Number(init[2]), values[key]).filter(item=> item !== null)
          break
        case 'baselineConfigInfoExt2':
          if(init[1] !== 'undefined' && values[key] !== undefined && values[key] !== null)
            values.ports = isArr(key2, init[1], Number(init[2]), values[key]).filter(item=> item !== null)
          break
        default:
          break
      }
      if (key.indexOf('_') > -1)
        delete values[key]
    })
    if(this.state.stringId){
      values.id = this.state.stringId
      values.os = this.state.osId
      this.updateData(values)
    }else{
      this.sure(values)
    }
  }
  //更新
  updateData = (values)=>{
    api.updateBaseline(values).then(res => {
      message.success('操作成功')
      this.goBack()
    })
  }
  //登记
  sure = (values)=>{
    api.addBaseline(values).then(res => {
      message.success('操作成功')
      this.goBack()
    })
  }
  goBack = ()=>{
    this.props.history.goBack()
  }
}
const mapStateToProps = ({ baseSetting }) => {
  return {
    serveList: baseSetting.serveList,
    osList: baseSetting.osList
  }
}
const SettingRegisterForm = Form.create()(SettingRegisterForms)
export default withRouter(connect(mapStateToProps)(SettingRegisterForm))