import { Component } from 'react'
import { connect } from 'dva'
import { withRouter } from 'react-router-dom'
import { Form, Input, Col, Select, Button, Message, DatePicker, InputNumber } from 'antd'
import { array } from 'prop-types'
import { THREAT_GRADE } from '@a/js/enume'
import moment from 'moment'
import debounce from 'lodash/debounce'
import { analysisUrl } from '@u/common'
import api from '@/services/api'
import { validateOneFloat } from '@u/validate'

const Option = Select.Option
const { Item } = Form
const TextArea = Input.TextArea

@withRouter
@Form.create()
class BugChangeForm extends Component {
  static propTypes = {
    bugTypeList: array
  }
  constructor (props) {
    super(props)
    this.lastFetchId = 0
    this.fetchUser = debounce(this.fetchUser, 500)
    this.state = {
      id: analysisUrl(props.location.search).id,
      detailData: {},
      bugTypeList: props.bugTypeList,
      data: [],
      value: [],
      fetching: false
    }
  }
  componentDidMount () {
    //获取漏洞类型列表
    this.props.dispatch({ type: 'bugPatch/listVulType', payload: {} })
    this.getDetail()
  }

  render () {
    const { bugTypeList } = this.props
    const { getFieldDecorator } = this.props.form
    const formLayout = {
      labelCol: {
        span: 6
      },
      wrapperCol: {
        span: 16
      }
    }
    const formLayoutBlock = {
      labelCol: {
        span: 2
      },
      wrapperCol: {
        span: 22
      }
    }
    const { detailData } = this.state
    return (
      <div className="edit-form-content">
        <Form>
          <div className="form-wrap clearfix">
            <Col span={8}>
              <Item {...formLayout} label="安天编号">
                {
                  getFieldDecorator('antiyVulnId', {
                    rules: [
                      { required: true, message: '请输入安天编号！' },
                      { message: '最多64个字符！', max: 64 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.antiyVulnId
                  })(
                    <Input allowClear={detailData.antiyVulnId ? false : true} placeholder="请输入" autoComplete="off" disabled={detailData.antiyVulnId ? true : false} />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="CNNVD编号">
                {
                  getFieldDecorator('cnnvdId', {
                    rules: [
                      { message: '最多60个字符！', max: 60 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.cnnvdId
                  })(
                    <Input allowClear={detailData.cnnvdId ? false : true} placeholder="请输入" autoComplete="off" disabled={detailData.cnnvdId ? true : false} />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="CVE编号">
                {
                  getFieldDecorator('cveId', {
                    rules: [
                      { message: '最多60个字符！', max: 60 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.cveId
                  })(
                    <Input allowClear={detailData.cveId ? false : true} placeholder="请输入" autoComplete="off" disabled={detailData.cveId ? true : false} />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="CNVD编号">
                {
                  getFieldDecorator('cnvdId', {
                    rules: [
                      { message: '最多60个字符！', max: 60 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.cnvdId
                  })(
                    <Input allowClear={detailData.cnvdId ? false : true} placeholder="请输入" autoComplete="off" disabled={detailData.cnvdId ? true : false} />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="漏洞名称">
                {
                  getFieldDecorator('vulnName', {
                    rules: [
                      { required: true, message: '请输入漏洞名称！' },
                      { message: '最多512个字符！', max: 512 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.vulnName
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="漏洞类型">
                {
                  getFieldDecorator('vulnType', {
                    rules: [{ required: true, message: '请选择' }],
                    initialValue: detailData.vulnType && detailData.vulnType + ''
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        bugTypeList.map((item, index) => {
                          return (<Option key={item.id}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="危害级别">
                {
                  getFieldDecorator('warnLevel', {
                    rules: [{ required: true, message: '请选择' }],
                    initialValue: detailData.warnLevel && detailData.warnLevel + ''
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        THREAT_GRADE.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="漏洞来源">
                {
                  getFieldDecorator('source', {
                    rules: [
                      { message: '最多512个字符！', max: 512 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.source
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
            </Col>
            <Col span={8} className="inline-form-item">
              <div className="custom-label">CVSS</div>
              <Item>
                {
                  getFieldDecorator('cvssselect', {
                    initialValue: detailData.cvssselect
                  })(
                    <Select
                      allowClear
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="请选择" >
                      {
                        ['V2.0', 'V3.0'].map(item => {
                          return (<Option key={item}>{item}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
              <Item>
                {
                  getFieldDecorator('cvssinput', {
                    initialValue: detailData.cvssinput
                  })(
                    <InputNumber
                      min={0.0}
                      max={10}
                      step={0.1}
                      parser={value => validateOneFloat(value)}
                      autoComplete="off"
                      placeholder="请输入" />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout}  label="漏洞发布时间">
                {
                  getFieldDecorator('publishedDate', {
                    rules: [{ required: true, message: '请选择漏洞发布时间！' }],
                    initialValue: detailData.publishedDate && moment(detailData.publishedDate - 0)
                  })(
                    <DatePicker
                      getCalendarContainer={triggerNode => triggerNode.parentNode}
                      placeholder='请选择日期'
                      disabledDate={(current) => current && current > moment().endOf('day')} />
                  )
                }
              </Item>
            </Col>
            <Col span={24} className="form-block">
              <Item {...formLayoutBlock} label="漏洞描述">
                {
                  getFieldDecorator('description', {
                    rules: [
                      { message: '最多900个字符！', max: 900 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.description
                  })(
                    <TextArea rows={6} placeholder="请输入" />
                  )
                }
              </Item>
            </Col>
          </div>
        </Form>
        <div className="button-center">
          <div>
            <Button type="primary" onClick={this.handleSubmit} style={{ marginRight: 0 }}>保存</Button>
          </div>
        </div>
      </div>
    )
  }

  //提交
  handleSubmit = debounce(() => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        let { cvssselect, cvssinput } = values
        if ((cvssselect || cvssinput || cvssinput === 0) && !(cvssselect && (cvssinput || cvssinput === 0) )) {
          Message.info('CVSS下拉框和输入框都需要填写！')
          return false
        }
        if (cvssselect && (cvssinput || cvssinput === 0)) {
          values.cvss = [`${cvssselect}-${cvssinput}`]
        } else {
          values.cvss = []
        }
        values.publishedDate = values.publishedDate.valueOf()
        delete values.cvssselect
        delete values.cvssinput
        api.bugChange(values).then(response => {
          Message.success('变更成功！')
          this.props.history.push('/bug/formal')
        })
      }
    })
  }, 1000, { leading: true, trailing: false })

  //获取漏洞详情
  getDetail = () => {
    api.getBugDetail({
      antiyVulnId: this.state.id
    }).then(response => {
      const body = response.body
      body.cvss = body.cvss || []
      if (body.cvss.length) {
        const [cvssselect, cvssinput] = body.cvss[0].split('-')
        body.cvssselect = cvssselect
        body.cvssinput = cvssinput
      }
      this.setState({
        detailData: body
      })
    })
  }

  //模糊查询品类型号
  fetchUser = value => {
    this.lastFetchId += 1
    const fetchId = this.lastFetchId
    this.setState({ data: [], fetching: true })
    let param = {
      pageSize: 50,
      currentPage: 1,
      productName: value
    }

    api.bugHardsoftlib(param).then(response => {
      if (fetchId !== this.lastFetchId) {
        return
      }
      if (response.body) {
        const data = response.body.map(item => {
          return {
            label: `${item.productName}-${item.supplier}-${item.version}`,
            key: item.businessId
          }
        })
        this.setState({ data, fetching: false })
      }
    })
  };

  //取消模糊查询
  handleChange = value => {
    this.setState({
      value,
      data: [],
      fetching: false
    })
  }
}
const mapStateToProps = ({ bugPatch }) => {
  return {
    bugTypeList: bugPatch.bugTypeList
  }
}
export default connect(mapStateToProps)(BugChangeForm)