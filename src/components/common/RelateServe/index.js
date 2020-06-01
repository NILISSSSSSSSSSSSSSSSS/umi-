import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Table, TableBtns, RelateModal, Tooltip } from '@c/index'
import { STORAGEED } from '../../../assets/js/enume'
import { connect } from 'dva'
import { getServicesList } from '@services/assetServices'
import { message } from 'antd'

// 关联服务
/**
 * queryConfig: { Object } 操作按钮的请求配置， 注意：getList、addFunc、delFunc为定义的
 *                {
 *                  getList: Function()=>data,  // 获取已经关联的服务
 *                  addFunc: Function()=>data, // 添加服务请求
 *                  delFunc: Function()=>data, // 删除已经关联的服务
 *                  params: Object, // 以上三个函数的公共请求参数
 *                }
 */
const rowKey = 'businessId'
class RelateServe extends Component {
  static propTypes = {
    queryConfig: PropTypes.object
  }
  static defaultProps = {
    queryConfig: {}
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
    this.searchFields = [ { label: '服务名', key: 'service', type: 'input' },
      { label: '显示名', key: 'displayName', type: 'input' },
      { label: '服务类型', key: 'serviceClasses', type: 'select', data: [], config: { value: 'businessId' } },
      { key: 'version', label: '版本', type: 'input', placeholder: '请输入版本' },
      { key: 'sysVersion', label: '系统版本', type: 'input', placeholder: '请输入系统版本' },
      { key: 'softVersion', label: '软件版本', type: 'input', placeholder: '请输入软件版本' },
      { key: 'softPlatform', label: '软件平台', type: 'input', placeholder: '请输入软件平台' },
      { key: 'hardPlatform', label: '硬件平台', type: 'input', placeholder: '请输入硬件平台' },
      { key: 'language', label: '语言', type: 'input', placeholder: '请输入语言' }
    ]
    // 表格上部的右边按钮
    this.leftBtns = [ { label: '添加服务', onClick: this.openAddServiceModal } ]
    this.actions = disabledOperation ? [] : [{ label: '删除', check: true, type: 'btn', config: { name: 'service' }, confirm: { onOk: this.singledelService, text: '确认删除关联的服务？' } }]
  }

  componentDidMount () {
    const { currentPage, pageSize } = this.state
    const { dispatch } = this.props
    dispatch({ type: 'assetServices/getServiceTypes' })
    this.getList({ currentPage, pageSize })
  }
  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    this.setServeTypes(nextProps.serveTypes)
  }
  setServeTypes = (serveTypes = []) => {
    this.searchFields = this.searchFields.map((e)=>{
      if(e.key === 'serviceClasses'){
        return { ...e, data: serveTypes }
      }
      return e
    })
  }
  /**
   * 删除部件关联的服务
   * @param record
   */
  singledelService = (record) => {
    const { delFunc, params } = this.props.queryConfig
    delFunc && delFunc({ id: record[rowKey], ...params }).then(()=>{
      const { list, pageSize, currentPage  } = this.state
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
   * 打开添加服务的弹窗
   * @param record {Object} 当前服务的数据信息
   */
  openAddServiceModal = (record) => {
    this.setState({ modalData: { record, visible: true } })
  }
  /**
   * 获取列表数据
   * @param param
   */
  getList = (param = {}) => {
    const { getList, params = {} } = this.props.queryConfig
    getList && getList({ ...param, ...params, serviceBusinessId: params.excludeId }).then((res)=>{
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
    { dataIndex: 'service', title: '服务名', render: (text)=><Tooltip  placement="topLeft" title={text}>{text}</Tooltip> },
    { dataIndex: 'displayName', title: '显示名', render: (text)=><Tooltip title={text}>{text}</Tooltip>  },
    { dataIndex: 'serviceClassesStr', title: '服务类型' },
    { dataIndex: 'startupParameter', title: '启动参数', render: (text)=><Tooltip title={text}>{text}</Tooltip>  },
    { dataIndex: 'describ', title: '描述', render: (text)=><Tooltip title={text}>{text}</Tooltip>  }
  ]
  pageChange = ({ current: currentPage, pageSize }) => {
    this.setState({ currentPage, pageSize })
    this.getList({ currentPage, pageSize })
  }
  /**
   * 关闭添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  closeAddServiceModal = (record) => {
    this.setState({ modalData: { record, visible: false } })
  }
  /**
   * 添加服务提交事件
   * @param keys 添加的服务keys
   * @param list 添加的服务数据集合
   */
  addService = (keys, list) => {
    const { addFunc, params } = this.props.queryConfig
    addFunc && addFunc({ ...params, keys: keys }).then(()=>{
      this.setState({ modalData: { visible: false } })
      message.success('关联成功!')
      const { currentPage, pageSize } = this.state
      this.getList({ currentPage, pageSize })
    })
  }
  /**
   * 获取已入库的服务列表
   * @param params
   * @return {*}
   */
  requestServeList = (params) => {
    const { params: configParams  = {} } = this.props.queryConfig || {}
    const { sourceType: serviceType, excludeId: serviceBusinessId  } = configParams
    return getServicesList({ ...params, isStorage: STORAGEED.value, serviceType, serviceBusinessId })
  }
  render () {
    const { list, total, pageSize, currentPage, modalData: { visible } } = this.state
    const { disabledOperation } = this.props
    return (
      <div className="table-wrap">
        { visible &&  <RelateModal rowKey={rowKey} searchFields={this.searchFields} request={this.requestServeList} columns={ this.columns } title="添加服务" visible={visible} onSubmit={this.addService} onClose={this.closeAddServiceModal}/> }
        { !disabledOperation && <TableBtns leftBtns={ this.leftBtns }/>}
        <Table rowKey={rowKey} columns={ this.columns } actions={this.actions} dataSource={ list } page={ { pageSize, currentPage, total } } onChange={ this.pageChange }/>
      </div>
    )
  }
}
export default connect(({ assetServices })=>({ serveTypes: assetServices.serveTypes }))(RelateServe)
