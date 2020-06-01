import React, { Component } from 'react'
import { Table, TableBtns, RelateModal } from '@c/index'
import PropTypes from 'prop-types'
import { message } from 'antd'

//关联端口
/**
 * queryConfig: { Object } 操作按钮的请求配置， 注意：getList、addFunc、delFunc为定义的
 *                {
 *                  getList: Function()=>data,  // 获取已经关联的服务
 *                  addFunc: Function()=>data, // 添加服务请求
 *                  delFunc: Function()=>data, // 删除已经关联的服务
 *                  params: Object, // 以上三个函数的公共请求参数
 *                }
 */
export default class ServeDetailPort extends Component {
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
      modalData: { visible: false, data: {} }

    }
    this.searchFields = [ { label: '端口号', key: 'port', type: 'select', data: [] }, { label: '描述', key: 'describe', type: 'input' } ]
    // 表格上部的右边按钮
    this.leftBtns = [ { label: '添加端口', onClick: this.openAddPortModal } ]
    this.actions = disabledOperation ? [] : [{ label: '删除', check: true, type: 'btn', config: { name: 'port' }, confirm: { onOk: this.singledelPort } }]
  }

  componentDidMount () {
    const { currentPage, pageSize } = this.state
    this.getList({ currentPage, pageSize })
  }
  /**
   * 删除部件关联的硬件
   * @param record
   */
  singledelPort = (record) => {
    const { delFunc, params } = this.props.queryConfig
    delFunc && delFunc({ id: record.stringId, ...params }).then(()=>{
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
   * 打开添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  openAddPortModal = (record) => {
    this.setState({ modalData: { record, visible: true } })
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
    { dataIndex: 'port', title: '端口号' },
    { dataIndex: 'memo', title: '描述' }
  ]
  pageChange = ({ current: currentPage, pageSize }) => {
    this.setState({ currentPage, pageSize })
    this.getList({ currentPage, pageSize })
  }
  /**
   * 添加设备提交事件
   * @param keys 添加的
   */
  addPort = (keys, list) => {
    const { addFunc, params } = this.props.queryConfig
    addFunc && addFunc({ ...params, keys: keys }).then(()=>{
      this.setState({ modalData: { visible: false } })
      message.success('关联成功!')
      const { currentPage, pageSize } = this.state
      this.getList({ currentPage, pageSize })
    })
  }
  /**
   * 关闭添加硬件的弹窗
   * @param record {Object} 当前部件的数据信息
   */
  closeAddPortModal = (record) => {
    this.setState({ modalData: { record, visible: false } })
  }
  render () {
    const { list, total, pageSize, currentPage, modalData: { visible } } = this.state
    const { disabledOperation } = this.props
    return (
      <div className="table-wrap">
        { visible &&  <RelateModal title="添加端口" columns={ this.columns } searchFields={this.searchFields} visible={visible} onSubmit={this.addPort} onClose={this.closeAddPortModal}/> }
        { !disabledOperation && <TableBtns leftBtns={ this.leftBtns }/>}
        <Table rowKey="stringId" actions={this.actions} columns={ this.columns } dataSource={ list } page={ { pageSize, currentPage, total } } onChange={ this.pageChange }/>
      </div>
    )
  }
}
