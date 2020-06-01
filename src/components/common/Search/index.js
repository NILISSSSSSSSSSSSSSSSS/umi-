import { Component } from 'react'
import { Form, Button, Input, TreeSelect, Select, Icon } from 'antd'
import { subNodeQuery } from '@/utils/common'
import { chunk, intersection } from 'lodash'
import PropTypes from 'prop-types'
import { withRouter } from 'dva/router'
import './index.less'
import DateRange from '../DateRange'

const { Item } = Form
const { SHOW_PARENT, TreeNode } = TreeSelect
const Option = Select.Option
// 指定的2列宽的查询字段
// const spans = ['multipleQuery', 'categoryModel', 'dateRange']
const spans = []
const defaultFieldsInit = [
  { label: '综合查询', maxLength: 30, className: '', key: 'multipleQuery', span: 12, style: { width: 638 }, type: 'input', placeholder: '名称/编号/IP' }
]
const effectsEvent = [ 'reset' ]
// const fieldListInit = [
//   { label: '单选', key: 'select', type: 'select', placeholder: '请选择', data: [ { label: 'a', value: 'a' } ] },
//   { label: '单选', key: 'select1', type: 'select', placeholder: '请选择', data: [ { label: 'a', value: 'a' } ] },
//   { label: '单选', key: 'select2', type: 'select', placeholder: '请选择', data: [ { label: 'a', value: 'a' } ] },
//   { label: '查询时间', key: 'dateRange', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [ ] },
//   { label: '品类型号', key: 'categoryModel', multiple: false, getChildrenKeys: true, config: { name: 'fullName', value: 'stringId' }, type: 'treeSelect', placeholder: '请选择', data: initData.selectTreeData }
// ]

/**
 * 注意：
 * props defaultFields { Array } 默认查询条件， 参考fieldList
 * props fieldList {Array} 查询条件的列表
 *        [
 *          {
 *            label: '', // 查询条件的显示名称
 *            key: '', // 查询条件的字段名
 *            type: 'select | dateRange | input',  // 查询条件的表单类型
 *            placeholder: String | [ String, String ] // 普通类型的是字符串，range类型为数组
 *            data: Array | Object 为选择类型表单的 下拉值，  Array: 是select 类型的 options， Object：是treeSelect的下拉选项
 *            multiple: Boolean, // 是否是对选，正对与下拉框选项有效
 *            initialValue: Array, // 只有在 type 为 dateRange时，才会生效
 *            getChildrenKeys: Boolean, // 是否获取下级及其后代节点的value，
 *            config: { name: String, value: String }, // name为下拉框类型表单的属性字段名，默认为name， value为下拉框类型表单的id属性字段名，默认为value
 *          }
 *        ]
 * props  onSubmit { Function } 查询提交时的回调函数
 * props  onReset { Function } 重置
 * props  column { Number } 分多少列渲染
 * props  resetShow { Boolean } 是否显示 【重置】 按钮
 * props  onChange { Function } 任意查询条件改变时的回调函数  注意，此函数不能设置props，否则将进入死循环
 */
@withRouter
class Search extends Component {
  constructor (props) {
    super(props)
    this.state = {
      conditionShow: false
    }
    // 点击重置按钮时，需要手动重置状态的
    this.manualResetFiled = ['dateRange']
    this.randomKey = Math.random()
    this.eventFunction = {
      reset: (arr = [])=>{
        const { resetFields } = this.props.form
        resetFields(arr)
      }
    }
  }

  static defaultProps ={
    fieldList: [],
    column: 3, // 分多少列渲染
    resetShow: true, // 是否显示 重置 按钮
    okText: '查询', // 查询按钮的显示
    defaultFields: defaultFieldsInit
  }
  static propTypes={
    fieldList: PropTypes.array,
    defaultFields: PropTypes.array,
    onSubmit: PropTypes.func,
    column: PropTypes.number,
    onSubonChangemit: PropTypes.func,
    onReset: PropTypes.func
  }

  componentDidMount () {
    if(this.props.searchFrom) this.props.searchFrom(this)
  }

  //展开搜索条件
  onExpand = () => {
    const { onExpand } = this.props
    let { conditionShow } = this.state
    this.setState({ conditionShow: !conditionShow })
    onExpand && onExpand(!conditionShow)
    //展开查询条件时，加载下拉框数据
    if(!conditionShow) {

    } else {
      // this.handleReset()
    }
  }
  /**
   * 任意查询条件改变时，触发此函数
   * 注意：此函数不能改变props，此处提供给导出时，改变查询条件，但未点击查询按钮时，传递最新的查询条件
   */
  onChange = () =>{
    this.getFieldsValues().then((values)=>{
      const { onChange } = this.props
      onChange && onChange(values)
    })
  }
  /**
   * 获取查询参数，并且进行查询
   */Search
  onSubmit = () => {
    this.getFieldsValues().then((values)=>{
      const { onSubmit } = this.props
      onSubmit && onSubmit(values)
    })
  }
  getFieldsValues = () => {
    return new Promise((resolve)=>{
      this.props.form.validateFields((err, values)=>{
        if(!err){
          const { fieldList } = this.props
          const params = { ...values }
          // 找出那些是要遍历子节点的ID的
          const _fieldList = fieldList.filter((e)=>e.getChildrenKeys)
          // 需要遍历子节点的
          if(_fieldList.length){
            _fieldList.forEach((e)=>{
              params[e.key] = values[e.key] ? subNodeQuery(e.data)(Array.isArray(values[e.key]) ? values[e.key] : [values[e.key]]) : values[e.key]
            })
          }
          resolve(params)
        }
      })
    })

  }
  /**
   * 点击查询按钮事件
   * @param e
   */
  handleSubmit = (e) => {
    e.preventDefault()
    this.onSubmit()
  }
  /**
   * 渲染formItem
   * @param fieldList
   * @return {any[]}
   * @private
   */
  _renderFormItem = (fieldList = [], column) => {
    return chunk(fieldList.filter((e) => e.check ? e.check(e) : true), column).map((row) => {
      return row.map((el, idx)=>{
        return this.renderComponent(el, idx)
      })
    })
  }
  /**
   * 渲染form的组件
   * @param el
   * @return {null|*}
   */
  renderComponent = (el = {}, idx) => {
    const { getFieldDecorator } = this.props.form
    const { type, label = '', span, key, placeholder, style, data, config, multiple = false, effects = [], showSearch = true, onSearch, ...other } = el
    const { name, value } = config || {}
    let component = null
    // 当前列占用几列
    const _span = spans.includes(type) ? 12 : ( span || 6 )
    let formLayout = { }
    if(_span === 12){
      // formLayout = { ...formLayout1 }
    }else{
      // formLayout = { ...formLayout2 }
    }
    const searchItemSeparation = idx === 1 ? 'search-item-separation ' : ''
    const formItemClass = 'search-from-item ' + searchItemSeparation
    // 自带组件时
    if(el.component){
      const Component = el.component
      return (
        <Item label={ label ? `${ label }:` : '' } { ...other} { ...formLayout} key={label} className={formItemClass}>
          { getFieldDecorator(key)(
            { Component }
          ) }
        </Item>
      )
    }
    switch(type) {
      case 'input': {
        // const _style = { width: key === 'multipleQuer  y' ? 638 : 240 }
        const _style = {}
        component = (
          <Item label={ label ? `${ label }:` : '' } { ...other} { ...formLayout} key={label} className={formItemClass}>
            { getFieldDecorator(key)(
              <Input autoComplete="off" allowClear placeholder={ placeholder || ('请输入' + label) } style={{ ...style, ..._style }} className={el.className } { ...other} />
            ) }
          </Item>
        )
        break
      }
      case 'select': {
        const mode =  multiple ? { mode: 'multiple' } : {}
        let _data = data
        let initialValue = {}
        const v = null
        // 多选没有全部选项
        if(!multiple){
          _data = (data || []).filter((e)=>e[name || 'name'] === '全部').length ? data : [ { [name || 'name']: '全部', [value || 'value']: v }, ...data]
          initialValue = { initialValue: v }
        }
        component = (
          <Item label={ label ? `${ label }:` : '' } { ...formLayout} key={label} className={formItemClass}>
            { getFieldDecorator(key, { ...initialValue })(
              <Select getPopupContainer={triggerNode => triggerNode.parentNode} placeholder={ placeholder || ( '请选择' +  label) } optionFilterProp="label" showSearch={showSearch} onSearch={onSearch} style={{ ...style }} { ...style } { ...other} { ...mode} className="filter-form-item">
                {
                  _data.map((e, i) => {
                    return (
                      <Option key={ i } value={ e[value || 'value'] } label={e[name || 'name']}>{ e[name || 'name'] }</Option>
                    )
                  })
                }
              </Select>
            ) }
          </Item>
        )
        break
      }
      case 'treeSelect': {
        const { onChange, ..._other } = other
        const className = 'filter-form-item ' + el.className
        component = (
          <Item label={ label ? `${ label }:` : '' } { ...formLayout} key={label} className={formItemClass}>
            {
              getFieldDecorator(key)(
                <TreeSelect
                  allowClear
                  getPopupContainer={triggerNode => triggerNode.parentNode}
                  // style={{ width: 174 }}
                  style={{ ...style }}
                  dropdownStyle={ { maxHeight: 400, overflow: 'auto' } }
                  placeholder={ placeholder || ('请选择' + label) }
                  // style={{ width: '100%' }}
                  multiple={multiple}
                  onChange={(val, lab, extra)=>{
                    // 特殊影响事件，在特征库、版本库影响到了版本的选择
                    if(effects.length){
                      effects.forEach((effect)=>{
                        if(effect.key){
                          const hasEvent = intersection((effect.event || []), effectsEvent) || []
                          if(hasEvent.length){
                            hasEvent.forEach((event)=>{
                              this.eventFunction[event](effect.key)
                            })
                          }
                        }
                      })
                    }
                    onChange && onChange(val, lab, extra)
                  }}
                  treeDefaultExpandAll
                  showCheckedStrategy={SHOW_PARENT}
                  treeCheckable={multiple}
                  treeNodeFilterProp='title'
                  showSearch={showSearch}
                  onSearch={onSearch}
                  { ...style }
                  { ..._other }
                  className={className}
                >
                  {
                    this.renderCategoryModelNodeTree(data, { name, value })
                  }
                </TreeSelect>
              )
            }
          </Item>
        )
        break
      }
      case 'dateRange': {
        component = (
          <Item label={ label ? `${ label }:` : '' } { ...formLayout} key={label} className={formItemClass}>
            {
              getFieldDecorator(key)(
                <DateRange placeholder={placeholder}  style={{ width: 638, ...style }} resetKey={this.randomKey} className="filter-form-item" { ...other} />
              )
            }
          </Item>
        )
        break
      }
      default :
        return null
    }
    return component
  }
  /**
   * 重置数据
   */
  handleReset = (keys = []) => {
    const { fieldList = [], defaultFields, form, onReset } = this.props
    const fieldKeys = fieldList.concat(defaultFields).filter((e) => e.check ? e.check(e) : true).map((e) => e.key)
    const resetKeys = keys.concat(fieldKeys)
    resetKeys.length && form.resetFields(resetKeys)
    // 重置时，需要手动重置
    if(this.manualResetFiled.includes('dateRange')){
      this.randomKey = Math.random()
    }
    if(onReset){
      onReset()
    }else {
      this.onSubmit()
    }
  }
  //渲染关联设备型号
  renderCategoryModelNodeTree = (data = {}, config = {}) => {
    return (
      <TreeNode value={data[config.value || 'stringId']} title={data[config.name || 'name']} key= {`${data[config.value || 'value']}`}>
        {
          data.childrenNode && data.childrenNode.length ? (
            data.childrenNode.map(item => {
              return this.renderCategoryModelNodeTree(item, config)
            })
          ) : null
        }
      </TreeNode>
    )
  }

  /**
   * 抽离指定的fileds
   */
  pullAway = (fields, list = []) => {
    const arr = []
    const last = []
    fields.forEach((el)=>{
      if(!list.includes(el.key)){
        arr.push(el)
      }else {
        last.push(el)
      }
    })
    return arr.concat(last)
  }
  /**
   * 是否给按钮设置margin-left值
   * @param defaultFields { Array }
   * @param column { Number }
   * */
  setBtnsMarginleft = (defaultFields = [], column) =>{
    // 获取行列数据
    const list = chunk(defaultFields.filter(e=>e.check ? e.check(e) : true), column)
    // 只有一行时
    if(list.length === 1){
      // 只有一列时,按钮设置margin-left值
      if(list[0].length === 1){
        return true
      }else {
        return false
      }
    }else if(list.length > 1){ // 多行时
      // 最后一行只有一列时,按钮设置margin-left值
      if(list[list.length - 1].length === 1){
        return true
      }else {
        return false
      }
    }
  }
  render () {
    const { fieldList, defaultFields, column, resetShow, okText } = this.props
    const { conditionShow } = this.state
    // const column = 4
    const fields = this.pullAway(fieldList, ['dateRange'])
    // const _fieldList = _.chunk(fields, column)
    const _fieldList = fields
    this.onChange()
    const isMarginLeft = this.setBtnsMarginleft(defaultFields, column) ? '' : ' search-from-no-margin-left '
    return (
      <div className="custom-form">
        <Form className='filter-form' layout="inline"  onSubmit={ this.handleSubmit }>
          <div className="default-filter-item">
            {this._renderFormItem(defaultFields, column)}
            <Item className={`search-item search-more-item search-from-btn ${isMarginLeft}`}>
              <div className="search-from-btn-content">
                <Button type="primary" htmlType='submit'>{okText}</Button>
                { resetShow && <Button type="primary" ghost onClick={ () => this.handleReset() }>重置</Button> }
                {
                  fields.length ? (
                    <span className='show-ondition' onClick={ this.onExpand }>
                      <Icon type={ conditionShow ? 'up' : 'down' }/>
                      { conditionShow ? '收起' : '高级查询' }
                    </span>
                  ) : null
                }
              </div>
            </Item>
          </div>
          <div className={ 'hide-form ' + ( conditionShow ? 'flex' : 'none')} >
            {this._renderFormItem(_fieldList, column)}
          </div>
        </Form>
      </div>
    )
  }
}
export default Form.create()(Search)
