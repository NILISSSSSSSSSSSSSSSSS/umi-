import React, { Component } from 'react'
import { Table, TableBtns, RelateModal, Tooltip } from '@c/index'
import { message } from 'antd'
import PropTypes from 'prop-types'
import api from '@services/api'
import { STORAGEED } from '@a/js/enume'
/**
 * 关联硬件
 * queryConfig: { Object } 操作按钮的请求配置， 注意：getList、addFunc、delFunc为定义的
 *                {
 *                  getList: Function()=>data,  // 获取已经关联的服务
 *                  addFunc: Function()=>data, // 添加服务请求
 *                  delFunc: Function()=>data, // 删除已经关联的服务
 *                  params: Object, // 以上三个函数的公共请求参数
 *                }
 * @param sourceType:  类型（组件assembly,协议protocol,服务service） ,
 * @param businessId:  ,
 */
const rowKey = 'businessId'
export default class PartWithHard extends Component {
  static propTypes = {
    queryConfig: PropTypes.object
  }
  static defaultProps = {
    queryConfig: {},
    disabledOperation: false  // 是否禁止操作，纯展示
  }
  constructor (props) {
    super(props)
    const { disabledOperation } = props
    this.state = {
      list: [],
      total: 0,
      pageSize: 10,
      currentPage: 1,
      modalData: { visible: false }
    }
    this.searchFields = [
      { label: '厂商', key: 'supplier', type: 'input', placeholder: '请输入厂商' },
      { label: '名称', key: 'productName', type: 'input', placeholder: '请输入名称' },
      { key: 'version', label: '版本', type: 'input', placeholder: '请输入版本' },
      { key: 'sysVersion', label: '系统版本', type: 'input', placeholder: '请输入系统版本' },
      { key: 'softVersion', label: '软件版本', type: 'input', placeholder: '请输入软件版本' },
      { key: 'softPlatform', label: '软件平台', type: 'input', placeholder: '请输入软件平台' },
      { key: 'hardPlatform', label: '硬件平台', type: 'input', placeholder: '请输入硬件平台' },
      { key: 'language', label: '语言', type: 'input', placeholder: '请输入语言' }
    ]
    // 表格上部的右边按钮
    this.leftBtns = [ { label: '添加硬件', onClick: this.openAddHardModal } ]
    this.actions = disabledOperation ? [] : [{ label: '删除', check: true, type: 'btn', config: { name: 'productName' }, confirm: { onOk: this.singledelHard, text: '确认删除关联的硬件？' } }]
  }

  componentDidMount () {
    const { currentPage, pageSize } = this.state
    this.getList({ currentPage, pageSize })
  }

  /**
   * 获取列表数据
   * @param param
   */
  getList = (param = {}) => {
    const { getList, params } = this.props.queryConfig
    getList && getList({ ...param, ...params }).then((res)=>{
      const { items, totalRecords } = res.body || {}
      this.setState({ list: items || [], total: totalRecords })
      this.isGetLastList({ ...res.body, currentPage: param.currentPage })
    })
  }
  /**
   * 是否请求最后一页数据
   */
  isGetLastList = ({ currentPage, pageSize, totalRecords: total = 0, items } = {}) => {
    const { values } = this.state
    // 第一或者当前有数据时
    if(currentPage === 1 || currentPage === 0 || (items || []).length) {
      return
    }
    // 找到最优一页
    const _currentPage = Math.ceil(total / pageSize)
    this.setState({ page: { currentPage: _currentPage, pageSize } })
    this.getList({ ...values, currentPage: _currentPage, pageSize })
  }
  columns = [
    { dataIndex: 'supplier', title: '厂商', render: (text)=><Tooltip title={text} placement="topLeft">{text}</Tooltip> },
    { dataIndex: 'productName', title: '名称', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'version', title: '版本', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'upgradeMsg', title: '更新信息', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'sysVersion', title: '系统版本', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'language', title: '语言' },
    { dataIndex: 'softVersion', title: '软件版本', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'softPlatform', title: '软件平台', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'hardPlatform', title: '硬件平台', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
    { dataIndex: 'other', title: '其它', render: (text)=><Tooltip title={text}>{text}</Tooltip> }
  ]
  /**
   * 翻页事件、改变每页显示数量事件
   * @param currentPage
   * @param pageSize
   */
  pageChange = ({ current: currentPage, pageSize }) => {
    this.setState({ currentPage, pageSize })
    this.getList({ currentPage, pageSize })
  }
  /**
   * 打开添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  openAddHardModal = (record) => {
    this.setState({ modalData: { record, visible: true } })
  }
  /**
   * 关闭添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  closeAddHardModal = (record) => {
    this.setState({ modalData: { record, visible: false } })
  }
  /**
   * 删除部件关联的硬件
   * @param record
   */
  singledelHard = (record) => {
    const { delFunc, params } = this.props.queryConfig
    delFunc && delFunc({ id: record[rowKey], ...params }).then(()=>{
      const {  list, pageSize, currentPage  } = this.state
      message.success('解除关联成功!')
      // 当删除最后一页并且只有一条数据时，删除之后，向前翻一页
      if(currentPage > 1 && list.length === 1){
        this.getList({ pageSize, currentPage: currentPage - 1 })
      }else {
        this.getList({ pageSize, currentPage })
      }
    })
  }
  /**
   * 添加设备提交事件
   * @param keys 添加的
   */
  addHardware = (keys, list) => {
    const { addFunc, params } = this.props.queryConfig
    addFunc && addFunc({ ...params, keys: keys }).then(()=>{
      message.success('关联成功!')
      this.setState({ modalData: { visible: false } })
      const { currentPage, pageSize } = this.state
      this.getList({ currentPage, pageSize })
    })
  }
  /**
   * 获取硬件列表
   * @param params
   * @return {void|*|IterableIterator<*|*>}
   */
  requestHardList = (params) => {
    const { params: configParams  = {} } = this.props.queryConfig || {}
    const { sourceType, excludeId: exceptIds } = configParams
    return api.soHardwareList({ ...params, businessId: exceptIds,  assetType: 'HARD', isStorage: STORAGEED.value, sourceType, exceptIds: [ exceptIds ] })
  }
  render () {
    const { list, total, pageSize, currentPage, modalData: { visible } } = this.state
    const { disabledOperation } = this.props
    return (
      <div className="table-wrap">
        { visible &&  <RelateModal rowKey={rowKey} title="添加硬件" request={this.requestHardList} searchFields={this.searchFields} columns={ this.columns } visible={visible} onSubmit={this.addHardware} onClose={this.closeAddHardModal}/> }
        { !disabledOperation && <TableBtns leftBtns={ this.leftBtns }/>}
        <Table rowKey={rowKey} actions={this.actions} columns={ this.columns } dataSource={ list } page={ { pageSize, currentPage, total } } onChange={ this.pageChange }/>
      </div>
    )
  }
}
