import { Component } from 'react'
import { Form, Row, Col, Select, Input, Button, InputNumber } from 'antd'
import './style.less'
import { validateFloatingPoint } from '@u/validate'
import { debounce } from 'lodash'
import api from '@/services/api'

const { Item } = Form
const { Option } = Select

export default class SettingRegisterFooter extends Component {
  constructor (props) {
    super(props)
    this.state = {
      list: [],
      handle: true,
      config: props.config,
      serviceList: [],
      num: undefined,
      serveListn: false
    }
    this.elIndex = 0
    this.selectService = debounce(this.selectService, 800)
  }
  //渲染组件
  renderItem = (item, key) => {
    let el
    let { serviceList, serveListn } = this.state
    switch (true) {
      case item.type === 'select':
        el = (
          <Select
            className={`base-form-item ${!serviceList.length && item.key.indexOf('_service_') > 0 && 'noitem-drop'}`}
            style={{ width: '310px' }}
            showSearch
            placeholder={item.name === '关联服务' ? '请输入并选择' : '请选择'}
            defaultActiveFirstOption={false}
            filterOption={false}
            onSearch={(v) => this.selectService(v, item.search)}
            onBlur={() => this.setState({ serviceList: [] })}
            notFoundContent={false}
            onSelect={(v, opt) => this.setKey(v, opt, item.search, item.key)}
            getPopupContainer={triggerNode => triggerNode.parentNode}
            allowClear
          >
            {
              item.key.indexOf('_service_') < 0 || (item.key.length < 10 && item.key !== 'select') ?
                item.data.map((opt, i) => {
                  if (!opt.businessId)
                    return (
                      <Option value={opt.value} key={opt.value} label={opt.name} ids={opt.value}>{opt.name}</Option>
                    )
                })
                : serviceList.length && serviceList.map((item) => <Option key={item.businessId} value={item.name}>{item.name}</Option>)
            }
          </Select>
        )
        break
      case item.type === 'InputNumber':
        el = <InputNumber min={0} max={65535} className="base-form-item" placeholder="请输入" precision={0} parser={value => validateFloatingPoint(value)} />
        break
      default:
        el = <Input placeholder="请输入" autoComplete='off' className="base-form-item" />
        break
    }
    return el
  }
  selectService = (value, item) => {
    if (item) {
      this.setState({
        serveListn: true
      }, () =>
        api.getRelationService({ service: value }).then(response => {
          this.setState({
            serviceList: response.data.body
          })
        }))
    }
  }
  setKey = (value, item, type, key) => {
    if (type && value) {
      let str = key.split('_')
      let num = Number(str[str.length - 1])
      let obj = {}
      let arr = JSON.parse(sessionStorage.getItem('service')) || []
      obj[value] = item.key
      if (this.props.value.length)
        arr[num - 1] = obj
      else arr[num] = obj
      sessionStorage.setItem('service', JSON.stringify(arr))
    }
  }
  //点击添加
  elAdd = (obs, idx = 1, field = 'baselineConfigInfoExt2') => {
    const list = [].concat(this.state.list)
    if (idx && field === 'baselineConfigInfoExt') {
      let arr = JSON.parse(sessionStorage.getItem('service')) || []
      arr.push({})
      sessionStorage.setItem('service', JSON.stringify(arr))
    }
    list.push(this.each(2, obs))
    this.elIndex += 1
    this.setState({
      list
    })
  }
  //编列key
  each = (n, item) => {
    const { field } = this.props
    let _item = JSON.parse(JSON.stringify(item))
    for (let i = 0; i < n; i++) {
      _item[i].key = `${field}_${_item[i].key}_${this.elIndex}`
    }
    return _item
  }
  //点击删除
  elRemove = (index, field) => {
    let { list } = this.state
    if (list.length) {
      this.setState({ list: list.filter((el, i) => i !== index) })
    }
  }
  //遍历匹配的key,赋予默认值
  eachKey = () => {
    //挂载在组件的数据
    let { value } = this.props
    let { config } = this.state
    let init = []
    let ids = []
    for (let now of value) {
      let obj = {}
      const arr = Object.keys(now)
      if (now['service']) {
        let name = now['serviceName']
        obj[name] = now['service']
        ids.push(obj)
        sessionStorage.setItem('service', JSON.stringify(ids))
      }
      init.push(config.map(item => {
        //找到匹配的字段
        let res = arr.filter(n => n === item.key)[0]
        //避免同一stack
        let items = JSON.parse(JSON.stringify(item))
        items.value = res === 'service' ? now['serviceName'] : now[res]
        return items
      }))
    }
    this.setState({
      handle: false,
      list: init.map(item => {
        let init = this.each(2, item)
        this.elIndex += 1
        return init
      })
    })
  }
  check = (nowKey, key) => {
    let checked = nowKey.split('_')[0] + '_' + key + '_' + nowKey.split('_')[2]
    const { form } = this.props
    let ob = form.getFieldsValue([checked])
    if (ob[checked] !== undefined && ob[checked] !== null) {
      return true
    }
    return false
  }
  componentDidMount () {
    if (sessionStorage.service)
      sessionStorage.removeItem('service')
    let { config } = this.state
    this.elAdd(config, 0)
  }
  componentWillUnmount () {
    sessionStorage.removeItem('service')
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.state.config) !== JSON.stringify(nextProps.config)) {
      this.setState({
        // list: [nextProps.config],
        config: nextProps.config
      })
    }
  }
  render () {
    let { list, config } = this.state
    const { value, title, form, field } = this.props
    const { getFieldDecorator } = form
    // 有数据时
    if (value.length && this.state.handle) {
      this.eachKey()
    }
    return (
      <div className="condition-create">
        <div className="header-title">
          <div>{title}</div>
          <div>
            <Button type="link" icon='plus' onClick={() => this.elAdd(config, 1, field)}>新增</Button>
          </div>
        </div>
        {
          list.length ? <Row>
            {
              list.map((item, n) => {
                return (
                  <div className="create-form-item" key={n} data-indexs={n}>
                    {
                      item.map((now, i) =>
                        <Col span={12} key={i}>
                          <Item label={now.name}>
                            {getFieldDecorator(now.key,
                              {
                                initialValue: now.value, rules: [{
                                  required: this.check(now.key, now.required), message: now.message
                                }]
                              })(
                              this.renderItem(now, now.key)
                            )}
                          </Item>
                        </Col>
                      )
                    }
                    {
                      list.length > 1 ? (
                        <div className="Item-footer-delete">
                          <Button type="link" icon='minus' onClick={() => this.elRemove(n, field)}>删除</Button>
                        </div>
                      )
                        : null
                    }
                  </div>
                )
              })
            }
          </Row> : null
        }
      </div>
    )
  }
}