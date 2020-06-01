import { PureComponent } from 'react'
import { Form, Input, Col, Select, TreeSelect, DatePicker, Switch, Radio, TimePicker, Checkbox, Popover, Icon } from 'antd'
import { chunk } from 'lodash'
import DateRange from '@c/common/DateRange'
import './index.less'
import { file } from '@babel/types'

const Option = Select.Option
const TreeNode = TreeSelect.TreeNode
const { TextArea } = Input
const renderPopverContent = content => {
  return (
    <span className="popover">
      {
        content ?
          <Popover content={ content }>
            <Icon type='question-circle' />
          </Popover>
          : null
      }
    </span>
  )
}
// const PopoverInput = ({ inputType, name, placeholder, popover, ...other }) =>{
//   return (
//     <div>
//       <Input autoComplete="off" type={inputType} placeholder={placeholder || `请输入${name}`} className="form-item-warp" { ...other}/>
//       { renderPopverContent(popover) }
//     </div>
//   )
// }
class PopoverInput extends PureComponent{
  render () {
    const { inputType, name, placeholder, popover, ...other } = this.props
    return(
      <div>
        <Input autoComplete="off" type={inputType} placeholder={placeholder || `请输入${name}`} className="form-item-warp" { ...other}/>
        { renderPopverContent(popover) }
      </div>
    )
  }
}
class CommonForm extends PureComponent {
  state = {
  }
  renderPopverContent = content => {
    return (
      <span className="popover">
        {
          content ?
            <Popover content={ content }>
              <Icon type='question-circle' />
            </Popover>
            : null
        }
      </span>
    )
  }
  validateDateRange = (rule, value, callback, message) => {
    if (!value[0] && message[0]) {
      callback(message[0])
    } else if (!value[1] && message[1]) {
      callback(message[1])
    } else {
      callback()
    }
  }
  /**
   * 根据表单项的类型，渲染表单项
   * @param filed 表单项
   * @param i 表单项索引
   */
  renderFormItem = (filed, i) => {
    const { form, FormItem, formLayout = {} } = this.props
    const { getFieldDecorator } =  form || { }
    const { type, name, key, rules, inputType = 'text', placeholder = '请输入', data, config, defaultValue: initialValue, showSearch = true, onSearch, popover, ...other } = filed || {}
    const { allowClear, disabled } = other
    // 默认允许删除
    const _allowClear = { allowClear: true }
    //设置不允许被删除或者禁用时，不允许被删除
    if( typeof allowClear === 'boolean' && !allowClear || disabled){
      _allowClear.allowClear = false
    }
    if(filed.component){
      const Component = filed.component
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(Component)}
        </FormItem>
      )

    }if(type === 'hidden'){
      return  (
        <FormItem label={name} { ...formLayout} key={i} style={{ display: 'none' }}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(<Input autoComplete="off" disabled={true} placeholder={placeholder || `请输入${name}`} className="form-item-warp" />)}
        </FormItem>
      )
    }else if(type === 'input'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <PopoverInput {  ..._allowClear } inputType={inputType} name={name} placeholder={placeholder} popover={popover} {...other}/>
          )}
        </FormItem>
      )
    }else if(type === 'select'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <Select getPopupContainer={triggerNode => triggerNode.parentNode} placeholder={placeholder || `请选择入${name}`} className="form-item-warp" optionFilterProp="label" autocomplete="off" { ...other}>
              {(data || []).map((e)=>{
                return (
                  <Option value={e.value} key={e.value} label={e.label || e.name}>{e.label || e.name}</Option>
                )
              })}
            </Select>
          )}
        </FormItem>
      )
    }else if(type === 'selectTree'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {
            getFieldDecorator(key, {
              rules,
              initialValue
            })(
              <TreeSelect
                allowClear
                treeDefaultExpandAll
                className="form-item-warp"
                getPopupContainer={triggerNode => triggerNode.parentNode}
                placeholder={placeholder || '请选择'}
                treeNodeFilterProp='title'
                showSearch={showSearch}
                onSearch={onSearch}
                { ...other}
              >
                {
                  this.renderCategoryModelNodeTree(data || [], config)
                }
              </TreeSelect>
            )
          }
        </FormItem>
      )
    }else if(type === 'date'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <DatePicker getCalendarContainer={triggerNode => triggerNode.parentNode} { ...other} className="form-item-warp"  { ...other}/>
          )}
        </FormItem>
      )
    }else if(type === 'timePicker'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <TimePicker getCalendarContainer={triggerNode => triggerNode.parentNode} { ...other} className="form-item-warp"  { ...other}/>
          )}
        </FormItem>
      )
    }else if(type === 'textArea'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <TextArea  placeholder={placeholder || '请选择'} className="form-item-warp" { ...other} { ...other}/>
          )}
        </FormItem>
      )
    }else if(type === 'dateRange'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            // rules,
            rules: [{
              validator: (rule, value, callback) => {
                this.validateDateRange(rule, value, callback, filed.rules[0].message)
              }
            }],
            initialValue
          })(
            <DateRange { ...other}/>
          )}
        </FormItem>
      )
    }else if(type === 'switch'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <span>
              <Switch {...other} /><span className="switch-label">{filed.switchLabel || ''}</span>
            </span>
          )}
        </FormItem>
      )
    }else if(type === 'radioGroup'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <Radio.Group { ...other}>
              {(data || []).map((e)=>{
                return (
                  <Radio value={e.value} key={e.value}>{e.label}</Radio>
                )
              })}
            </Radio.Group>
          )}
        </FormItem>
      )
    }else if(type === 'checkboxGroup'){
      return (
        <FormItem label={name} { ...formLayout} key={i}>
          {getFieldDecorator(key, {
            rules,
            initialValue
          })(
            <Checkbox.Group options={data || []} { ...other}
            />
          )}
        </FormItem>
      )
    }
  }
  //渲染关联设备型号
  renderCategoryModelNodeTree = (data = [], config) => {
    const { name, value } = config || {}
    return data.map((el)=>{
      //末节点才可被选择
      el.disabled = false
      if(el.childrenNode && el.childrenNode.length){
        el.disabled = true
      }
      return (
        <TreeNode value={el[value || 'value']} disabled={el.disabled} title={el[name || 'name']} key= {`${el[value || 'value']}`}>
          {
            this.renderCategoryModelNodeTree(el.childrenNode || [], config)
          }
        </TreeNode>
      )
    })
  }
  /**
   * 表单内容，根据传入的column可判断需要渲染成几列显示的表单，默认一列
   */
  render () {
    const { fields, column } = this.props
    return (
      <div className="form-content">
        <Form>
          <div className="form-wrap">
            {
              chunk(fields, column).map((el, idx)=>{
                return (
                  el.map((it, i) => {
                    return (
                      it.type !== 'hidden' ?
                        <Col key={i} span={ 24 / column }>
                          {this.renderFormItem(it, i)}
                        </Col> : this.renderFormItem(it, i)
                    )
                  })
                )
              })
            }
          </div>
        </Form>
      </div>

    )
  }
}
CommonForm.propTypes = {
}
CommonForm.defaultProps = {
}

export default CommonForm
