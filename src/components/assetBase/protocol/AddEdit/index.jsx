import { PureComponent } from 'react'
import { Button, Input, Form, Select, Tabs, Row, Col, message } from 'antd'
import { RelateSoftware, RelateServe } from '@c'
import { connect, router } from 'dva'
import { transliteration } from '@u/common'
import debounce from 'lodash/debounce'
import api from '@/services/api'
import './style.less'
const { Item } = Form
const { TextArea } = Input
const { Option } = Select
const { TabPane } = Tabs
const { withRouter } = router

class AddEdit extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      vulList: [],
      protocolData: {},
      businessId: this.props.businessId //编辑时带的id
    }
    this.isFetching = false
    const paramsConfig = { sourceType: 'protocol', excludeId: this.props.businessId }
    // 关联服务组件内部的封装请求
    this.serveQueryConfig = {
      params: { ...paramsConfig },
      getList: (params)=> {  // 获取协议的依赖服务列表
        let { businessId } = this.state
        return api.getProtocolService({ ...params, businessId })
      },
      delFunc: (params)=> {  // 删除协议的依赖服务
        const { businessId } = this.state
        return api.deleteProtocolService({ assetBusinessId: businessId, otherBusinessIds: [params.id] })
      },
      addFunc: (params)=> {  // 添加协议的依赖服务
        const { businessId } = this.state
        return api.addProtocolService({ assetBusinessId: businessId, otherBusinessIds: params.keys })
      }
    }
    // 关联软件组件内部的封装请求
    this.softwareQueryConfig = {
      params: { ...paramsConfig },
      getList: (params)=> {  // 获取组件的软件列表
        let { businessId } = this.state
        return api.getProtocolSoft({ ...params, businessId })
      },
      delFunc: (params)=> {  // 删除软件的关联软件
        const { businessId } = this.state
        return api.deleteProtocolSoft({ assetBusinessId: businessId, otherBusinessIds: [params.id] })
      },
      addFunc: (params)=> {  // 添加软件的关联软件
        const { businessId } = this.state
        return api.addProtocolSoft({ assetBusinessId: businessId, otherBusinessIds: params.keys })
      }
    }
    //关联漏洞的搜索延时（目的：不让每输入一个字母就发送请求）
    this.handleSearch = debounce(this.handleSearch, 800)
  }
  componentDidMount (){
    let { businessId } = this.state
    businessId && api.protocolQueryId({ businessId }).then(response => {
      this.setState({
        protocolData: response.data.body
      })
    })
  }

  render (){
    let { vulList, protocolData, businessId } = this.state
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {
      labelCol: {
        span: 2
      },
      wrapperCol: {
        span: 21
      }
    }
    const formItemLayout1 = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 15
      }
    }
    return(
      <div className="main-detail-content">
        <div className="search-bar detail-content">
          <Form className="form-page" onSubmit={this.isOkSubmit}>
            <Row>
              <Col  span = {8}>
                <Item {...formItemLayout1} label="协议名称">
                  {
                    getFieldDecorator('name', {
                      initialValue: protocolData.name,
                      rules: [{ required: true, message: '请输入协议' }, { message: '最多输入128个字符！', max: 128 }, { whitespace: true, message: '不能为空字符！' }]
                    })(
                      <Input autoComplete="off" className='ant-form-item-control-wrapper'  placeholder='请输入协议名称'/>
                    )
                  }
                </Item>
              </Col>
            </Row>
            <Item {...formItemLayout} label="关联漏洞">
              {
                getFieldDecorator('linkedVuls', {
                  initialValue: protocolData.linkedVuls || undefined,
                  rules: [{ validator: this.vulSelectChange }]
                  // validateTrigger: 'onChange'
                })(
                  <Select
                    className='multipleSelectScroll'
                    mode='multiple'
                    showSearch
                    placeholder='请输入关键字选择关联漏洞'
                    style={this.props.style}
                    defaultActiveFirstOption={false}
                    filterOption={false}
                    onSearch={this.handleSearch}
                    onBlur={() => this.setState({ vulList: [] })}
                    notFoundContent={false}
                    allowClear
                  >
                    { vulList && vulList.map((item) => <Option key={item.antiyVulnId}>{item.antiyVulnId}</Option>) }
                  </Select>
                )
              }
            </Item>
            <Item {...formItemLayout} label='备注'>
              {
                getFieldDecorator('memo', {
                  initialValue: protocolData.memo,
                  rules: [{ message: '最多输入300个字符！', max: 300 }, { whitespace: true, message: '不能为空字符！' }]
                })(
                  <TextArea className='ant-form-item-control-wrapper' rows={3}  placeholder='请输入备注'/>
                )
              }
            </Item>
            <Item className='button-center'>
              <Button type='primary' htmlType='submit'>保存</Button>
            </Item>
          </Form>
        </div>
        {/*  列表 */}
        {
          businessId &&
          <div className="table-wrap">
            <Tabs>
              <TabPane tab="依赖该协议的软件" key='1'>
                <RelateSoftware queryConfig={this.softwareQueryConfig}/>
              </TabPane>
              <TabPane tab="依赖该协议的服务" key='2'>
                <RelateServe queryConfig={this.serveQueryConfig}/>
              </TabPane>
            </Tabs>
          </div>
        }

      </div>
    )
  }
  //关联漏洞多选
  handleSearch = value => {
    let param = {
      antiyVulnId: value,
      currentPage: 1
    }
    const select = this.props.form.getFieldsValue(['linkedVuls']) || { linkedVuls: [] }
    const checkedIds = select.linkedVuls
    api.getRelevanceBugList({ ...param, checkedIds }).then(response => {
      this.setState({
        vulList: response.data.body
      })
    })
  }
  //关联漏洞20个
  vulSelectChange = (rule, value, callback) => {
    if (value && value.length > 20) {
      callback('最多可选20个关联漏洞')
    } else {
      callback()
    }
  }

  //保存
  isOkSubmit =(e)=> {
    e.preventDefault()
    if (this.isFetching) { // 如果是请求中，则结束
      return false
    }
    this.props.form.validateFields((err, values) => {
      if(!err){
        let { businessId } = this.state
        this.isFetching = true // 开始请求接口
        if(businessId){
          api.protocolUpdateSingle({ businessId, ...values }).then(() => {
            this.isFetching = false // 接口请求完成
            this.setState({
              businessId
            })
            message.info('编辑成功')
          }).catch(() => {
            this.isFetching = false // 接口请求完成
          })
        }else{
          api.protocolSaveSingle({ ...values }).then(response => {
            this.isFetching = false // 接口请求完成
            message.info('登记成功')
            this.props.history.push(`/assetBase/protocol/edit?stringId=${transliteration(response.data.body)}`)
          }).catch(() => {
            this.isFetching = false // 接口请求完成
          })
        }
      }
    })
  }
}
const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const AddEdits = Form.create()(AddEdit)
export default connect(mapStateToProps)(withRouter(AddEdits))
