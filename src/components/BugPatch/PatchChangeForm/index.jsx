import { Component } from 'react'
import { connect } from 'dva'
import debounce from 'lodash/debounce'
import { withRouter } from 'react-router-dom'
import { Form, Input, Col, Select, DatePicker, Button, Message } from 'antd'
import moment from 'moment'
import api from '@/services/api'
import {
  PATCH_INSTALL,
  PATCH_INTERNET,
  PATCH_INTERACTIVE,
  PATCH_HOT,
  PATCH_SOURCE,
  PATCH_STATUS,
  PATCH_LEVEL } from '@a/js/enume'
import { analysisUrl } from '@u/common'

const Option = Select.Option
const { Item } = Form
const TextArea = Input.TextArea

@withRouter
@Form.create()
class PatchChangeForm extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      detailData: {}
    }
  }
  componentDidMount () {
    const { id } = this.state
    //获取补丁详情
    this.props.dispatch({ type: 'bugPatch/getPatchDetail', payload: { param: id } })
  }
  render () {
    const { detailData } = this.props
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
    return (
      <div className="edit-form-content">
        <Form>
          <div className="form-wrap" style={{ overflow: 'hidden' }}>
            <Col span={8}>
              <Item {...formLayout} label="补丁安天编号">
                {
                  getFieldDecorator('antiyPatchNumber', {
                    rules: [
                      { required: true, message: '请输入补丁安天编号！' },
                      { message: '最多300个字符！', max: 300 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.antiyPatchNumber
                  })(
                    <Input allowClear={detailData.antiyPatchNumber ? false : true} placeholder="请输入" autoComplete="off" disabled={detailData.antiyPatchNumber ? true : false} />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="补丁编号">
                {
                  getFieldDecorator('patchNumber', {
                    rules: [
                      { required: true, message: '请输入安天编号！' },
                      { message: '最多300个字符！', max: 300 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.patchNumber
                  })(
                    <Input allowClear={detailData.patchNumber ? false : true} placeholder="请输入" autoComplete="off" disabled={detailData.patchNumber ? true : false} />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="补丁名称">
                {
                  getFieldDecorator('patchName', {
                    rules: [
                      { required: true, message: '请输入补丁名称！' },
                      { message: '最多180个字符！', max: 180 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.patchName
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="补丁等级">
                {
                  getFieldDecorator('patchLevel', {
                    rules: [{ required: true, message: '请选择' }],
                    initialValue: detailData.patchLevel
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        PATCH_LEVEL.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="补丁状态">
                {
                  getFieldDecorator('patchStatus', {
                    rules: [{ required: true, message: '请选择' }],
                    initialValue: detailData.patchStatus
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        PATCH_STATUS.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="补丁来源">
                {
                  getFieldDecorator('patchSource', {
                    rules: [{ required: true, message: '请选择' }],
                    initialValue: detailData.patchSource && detailData.patchSource + ''
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        PATCH_SOURCE.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout}  label="发布时间">
                {
                  getFieldDecorator('publishTime', {
                    rules: [{ required: true, message: '请选择发布时间！' }],
                    initialValue: detailData.publishTime && moment(detailData.publishTime - 0)
                  })(
                    <DatePicker
                      getCalendarContainer={triggerNode => triggerNode.parentNode}
                      placeholder='请选择日期'
                      disabledDate={(current) => current && current > moment().endOf('day')} />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="补丁信息来源">
                {
                  getFieldDecorator('patchInfoFrom', {
                    rules: [
                      { required: true, message: '请输入补丁信息来源！' },
                      { message: '最多250个字符！', max: 250 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.patchInfoFrom
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="补丁热支持">
                {
                  getFieldDecorator('hotfix', {
                    rules: [{ required: true, message: '请选择' }],
                    initialValue: detailData.hotfix && detailData.hotfix + ''
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        PATCH_HOT.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="用户交互">
                {
                  getFieldDecorator('userInteraction', {
                    initialValue: detailData.userInteraction
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        PATCH_INTERACTIVE.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="联网状态">
                {
                  getFieldDecorator('networkStatus', {
                    initialValue: detailData.networkStatus && detailData.networkStatus + ''
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        PATCH_INTERNET.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={8}>
              <Item {...formLayout} label="独占方式安装">
                {
                  getFieldDecorator('exclusiveInstall', {
                    initialValue: detailData.exclusiveInstall && detailData.exclusiveInstall + ''
                  })(
                    <Select
                      optionFilterProp="children"
                      getPopupContainer={triggerNode => triggerNode.parentNode}
                      placeholder="全部" >
                      {
                        PATCH_INSTALL.map((item, index) => {
                          return (<Option key={item.value}>{item.name}</Option>)
                        })
                      }
                    </Select>
                  )
                }
              </Item>
            </Col>
            <Col span={24} className="form-block">
              <Item {...formLayoutBlock} label="补丁描述">
                {
                  getFieldDecorator('description', {
                    rules: [
                      { required: true, message: '请输入补丁描述！' },
                      { message: '最多4000个字符！', max: 4000 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.description
                  })(
                    <TextArea rows={6} placeholder="请输入" />
                  )
                }
              </Item>
            </Col>
            <Col span={24} className="form-block">
              <Item {...formLayoutBlock} label="补丁审核意见">
                {
                  getFieldDecorator('patchAuditOpinions', {
                    rules: [
                      { required: true, message: '请输入补丁审核意见！' },
                      { message: '最多2000个字符！', max: 2000 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.patchAuditOpinions
                  })(
                    <TextArea rows={6} placeholder="请输入" />
                  )
                }
              </Item>
            </Col>
            <Col span={24} className="form-block">
              <Item {...formLayoutBlock} label="卸载步骤">
                {
                  getFieldDecorator('uninstallStep', {
                    rules: [
                      { message: '最多2000个字符！', max: 2000 },
                      { whitespace: true, message: '不能为空字符！' }
                    ],
                    initialValue: detailData.uninstallStep
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
            <Button type="primary" onClick={this.handleSubmit}>保存</Button>
          </div>
        </div>
      </div>
    )
  }

  //提交
  handleSubmit = debounce(() => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        values.hotfix = values.hotfix === '0' ? false : values.hotfix === '1' ? true :  null
        values.userInteraction = values.userInteraction === '0' ? false : values.userInteraction === '1' ? true :  null
        values.exclusiveInstall = values.exclusiveInstall === '0' ? false : values.exclusiveInstall === '1' ? true :  null
        values.networkStatus = values.networkStatus === '0' ? false : values.networkStatus === '1' ? true :  null
        values.publishTime = values.publishTime.valueOf()
        api.patchChange(values).then(response => {
          Message.success('变更成功！')
          this.props.history.push('/patch')
        })
      }
    })
  }, 1000, { leading: true, trailing: false })

}
const mapStateToProps = ({ bugPatch }) => {
  return {
    detailData: bugPatch.patchDetail
  }
}
export default connect(mapStateToProps)(PatchChangeForm)