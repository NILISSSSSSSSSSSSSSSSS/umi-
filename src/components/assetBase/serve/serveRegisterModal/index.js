import React, { Component } from 'react'
import { CommonModal } from '@c/index'
import { Form } from 'antd'
import './index.less'

const { Item } = Form

@Form.create()
class ServeRegisterModal extends Component {
  constructor (props){
    super(props)
    this.state = {}
    this.formFields = [
      { name: '服务名', key: 'name', placeholder: '请输入服务名', type: 'input', rules: [{ required: true,  message: '请输入服务名' },  ...this.generateRules()] },
      { name: '显示名', key: 'displayName', placeholder: '请输入显示名', type: 'input', rules: [{ required: true,  message: '请输入显示名' },  ...this.generateRules()] },
      { name: '服务类型', key: 'type', data: [], placeholder: '请选择服务类型', type: 'select', rules: [{ required: true,  message: '请选择服务类型' },  ...this.generateRules()] },
      { name: '启动参数', key: 'startupParameter', placeholder: '请输入启动参数', type: 'input' },
      { name: '描述', placeholder: '请输入描述', key: 'describ', type: 'textArea', rules: [{ required: true,  message: '请输入描述' },  ...this.generateRules()] }
    ]
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    this.formFields = this.setValues(this.formFields, nextProps.data)
  }

  /**
   *
   * 给字段这顶初始值
   * @param list
   * @param data
   * @return {(*|{defaultValue: *})[]}
   */
  setValues = (list = [], data = {}) => {
    return list.map((el)=>{
      return { ...el, defaultValue: data[el.key] }
    })
  }
  /**
   * 生成验证规则
   * @param max 最多字符数
   * @param rules {Array} 验证规则
   * @returns {*[]}
   */
  generateRules = (max = 30, rules = []) => {
    return [
      { max, message: `最多输入${max}字符！` },
      { whitespace: true, message: '不能为空字符！' },
      ...rules
    ]
  }
  /**
   * 注册、编辑提交
   * @param values
   */
  serveRegister = (values) => {
    const { onSubmit } = this.props
    console.log('serveRegister===>', values)
    onSubmit && onSubmit(values)
  }
  render () {
    const { visible, title, onClose } = this.props
    const formLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    }
    return (
      <CommonModal
        type="form"
        visible={visible}
        title={title}
        width={650}
        oktext="保存"
        value={this.serveRegister}
        onClose={onClose}
        fields={this.formFields}
        column={1}
        FormItem={Item}
        formLayout={formLayout}
      />
    )
  }
}

export default ServeRegisterModal
