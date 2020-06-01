import React, { Component } from 'react'
import moment from 'moment'
import { connect } from 'dva'
import { message } from 'antd'
import { Search, TableBtns, Table, Import, Tooltip } from '@c/index'  //引入方式
import { emptyFilter, transliteration, hasAuth, cache } from '@u/common'
import {
  getServicesList,
  batchDelServe,
  delServe,
  putStorage,
  batchPutStorage,
  queryExist
} from '@services/assetServices'
import { STATUS, NOT_FOUND, WAIT_STORAGE } from '../../../assets/js/enume'
import ACCSS from '@a/js/access'
import './index.less'

const { assetFuwuCheckin, assetFuwuImport, assetFuwuEntrybase, assetFuwuDelete, assetFuwuEdit, assetFuwuView } = ACCSS
const rowKey = 'businessId'
const searchIndex = 0
const SORT_ORDER = {
  ascend: 'asc',
  descend: 'desc'
}
class Serve extends Component {
  constructor (props) {
    super(props)
    this.state = {
      page: {
        currentPage: 1,
        pageSize: 10
      },
      list: [],
      sorter: {},
      columns: [
        {
          dataIndex: 'service',
          title: '服务名',
          isShow: true,
          render: (text) => <Tooltip title={ text } placement="topLeft">{ text }</Tooltip>
        },
        { dataIndex: 'displayName', isShow: false, title: '显示名',  render: (text) => <Tooltip title={ text }>{ text }</Tooltip> },
        { dataIndex: 'serviceClassesStr', isShow: true, title: '服务类型' },
        { dataIndex: 'describ', title: '描述', isShow: true,  render: (text) => <Tooltip title={ text }>{ text }</Tooltip> },
        { dataIndex: 'startupParameter', isShow: false, title: '启动参数',  render: (text) => <Tooltip title={ text }>{ text }</Tooltip> },
        {
          dataIndex: 'gmtCreate',
          title: '收录时间',
          sorter: true,
          sortOrder: undefined,
          isShow: true,
          render: (v) => !v ? emptyFilter(v) :
            <div className="tabTimeCss">{ moment(v).format('YYYY-MM-DD HH:mm:ss') }</div>
        },
        { dataIndex: 'isStorage', isShow: true, title: '状态', render: (v) => (STATUS.find(e => e.value === v) || NOT_FOUND).name }
      ],
      shows: [],
      total: 0,
      toLead: false,
      selectedRowKeys: [],
      selectedRows: [],
      modalData: { visible: false, data: {}, title: '' },
      values: {},   // 查询条件
      serveTypes: []
    }
    this.searchFields = [
      { key: 'service', label: '服务名', type: 'input' },
      {
        key: 'serviceClasses',
        label: '服务类型',
        type: 'select',
        config: { value: 'businessId' },
        multiple: false,
        data: []
      },
      { key: 'isStorage', label: '状态', data: STATUS, placeholder: '请选择状态', type: 'select', multiple: false },
      { key: 'startupParameter', label: '启动参数', type: 'input' },
      { key: 'displayName', label: '显示名', type: 'input' },
      { key: 'gmtCreate', label: '收录时间', type: 'dateRange' }
    ]
    // 表格上部的左边按钮
    this.leftBtns = [ {
      label: '登记',
      check: () => hasAuth(assetFuwuCheckin),
      onClick: this.registerClick
    }, {
      label: '导入', check: () => hasAuth(assetFuwuImport), onClick: () => {
        this.setState({ toLead: true })
      }
    } ]
    // 表格上部的右边按钮
    this.rightBtns = [
      // { label: '入库', checkUsable: this.checkUsable, confirm: { onOk: this.volumePutStorageEvent, text: ()=>this.renderInputBtnConfirmText('是否入库') } },
      {
        label: '入库',
        check: () => hasAuth(assetFuwuEntrybase),
        checkUsable: this.checkUsable,
        confirm: { onOk: this.volumePutStorageEvent, text: () => '确认入库服务？' }
      },
      {
        label: '删除',
        check: () => hasAuth(assetFuwuDelete),
        checkUsable: this.checkUsable,
        confirm: { onOk: this.delParts, text: () => '确认删除服务, 并且删除所有关联关系' }
      }
      // { label: '删除', checkUsable: this.checkUsable, confirm: { onOk: this.delParts, text: ()=>this.renderBtnConfirmText('是否删除') } }
    ]
    // 操作列项
    this.actions = [
      // { label: '入库', check: (record)=>record.isStorage === WAIT_STORAGE.value, type: 'btn', config: { name: 'service' }, confirm: { onOk: this.singlePutStorageEvent } },
      {
        label: '入库',
        check: (record) => (record.isStorage === WAIT_STORAGE.value) && hasAuth(assetFuwuEntrybase),
        type: 'btn',
        config: { name: 'service' },
        confirm: { onOk: this.singlePutStorageEvent, text: () => '确认入库服务？' }
      },
      { label: '编辑', check: () => hasAuth(assetFuwuEdit), type: 'btn', onClick: this.goToEdit },
      // { label: '删除', check: true, type: 'btn', config: { name: 'service' }, confirm: { onOk: this.singledelParts, text: (record)=>`是否删除 ${record.service} 服务, 并且删除所有关联关系?`  } },
      {
        label: '删除',
        check: () => hasAuth(assetFuwuEdit),
        type: 'btn',
        config: { name: 'service' },
        confirm: { onOk: this.singledelParts, text: () => '确认删除服务, 并且删除所有关联关系' }
      },
      { label: '查看', check: () => hasAuth(assetFuwuView), type: 'btn', onClick: this.goToDetail }
    ]
  }

  componentDidMount () {
    const { page } = this.state
    const { dispatch } = this.props
    const cacheData = cache.getCaches(this.search, true, searchIndex)
    let newState = { ...page }
    if(cacheData){
      const [ beginTime, endTime ] = cacheData.parameter.gmtCreate || []
      newState = { ...cacheData.page, ...cacheData.parameter, beginTime, endTime }
      if(cacheData.parameter.shows && cacheData.parameter.shows.length){
        const { columns } = this.state
        this.setState({ columns: columns.map((e, i)=>({ ...e, isShow: cacheData.parameter.shows[i] })), shows: cacheData.parameter.shows })
      }
      this.setState({ page: cacheData.page, values: { ...cacheData.parameter, beginTime, endTime } })
    }
    dispatch({ type: 'assetServices/getServiceTypes' })
    this.getList(newState, false)
  }

  UNSAFE_componentWillReceiveProps (nextProps, nextContext) {
    this.setServeTypes(nextProps.serveTypes)
  }
  /**
   * 获取存在状态，判断是否存在
   * @param businessId
   * @param callback
   */
  getDetail = async (businessId, callback) => {
    let init = void (0)
    // 获取改服务是否存在
    await queryExist({ businessId }).then(res => {
      init = res.body.status
      if(init){
        callback && callback()
      }
    })
    //该服务不存在时，刷新列表，并且给出提示
    if(typeof init === 'boolean' && !init){
      const { values, page } = this.state
      message.info('该服务已被删除！')
      this.getList({ ...values, ...page })
    }
  }
  setServeTypes = (serveTypes = []) => {
    this.searchFields = this.searchFields.map((e) => {
      if(e.key === 'serviceClasses') {
        return { ...e, data: serveTypes }
      }
      return e
    })
  }
  /**
   * 批量删除的提示语
   * @param text
   * @return {string}
   */
  renderBtnConfirmText = (text) => {
    const { selectedRows, selectedRowKeys } = this.state
    if(selectedRows.length) {
      return `${ text || '' } ${ selectedRows[ 0 ].service }${ selectedRowKeys.length > 1 ? ('等' + selectedRowKeys.length + '项服务') : ' 服务' }, 并且删除所有关联关系?`
    }
  }
  /**
   * 渲染批量入库的提示语
   * @param text
   * @return {string}
   */
  renderInputBtnConfirmText = (text) => {
    const { selectedRows } = this.state
    if(selectedRows.length) {
      return `${ text || '' } ${ selectedRows[ 0 ].service }${ selectedRows.length > 1 ? ('等' + selectedRows.length + '项服务') : ' 服务' }?`
    }
  }
  /**
   * 测批量按钮是否可用
   * @return {String}
   */
  checkUsable = () => {
    const { selectedRows } = this.state
    return selectedRows.length ? '' : '请先选择数据'
  }
  // 登记按钮点击事件
  registerClick = () => {
    const { history: { push } } = this.props
    push('/assetBase/serve/register')
    // this.setState({ modalData: { visible: true, data: {}, title: '服务登记' } })
  }
  /**
   * 行复选事件
   * @param selectedRowKeys
   * @param selectedRows
   */
  onSelectRows = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRowKeys, selectedRows })
  }
  // 批量入库事件
  volumePutStorageEvent = () => {
    const { selectedRowKeys } = this.state
    batchPutStorage({ businessIdList: selectedRowKeys }).then((res) => {
      if(res.body) {
        message.success(res.body)
      }
      const { values, page } = this.state
      //删除之后要清空选中的数据
      this.setState({ selectedRowKeys: [], selectedRows: [] })
      this.getList({ ...values, ...page })
    })
  }
  // 单个部件入库事件
  singlePutStorageEvent = (record) => {
    this.queryPutStorage(record[ rowKey ], () => {
      message.success('入库成功!')
    })
  }
  // 批量删除事件
  delParts = () => {
    const { selectedRowKeys } = this.state
    this.querydelParts(selectedRowKeys)
  }
  /**
   * 删除当前数据事件
   * @param record { Object} 当前操作数据
   */
  singledelParts = (record) => {
    delServe({ businessId: record[ rowKey ] }).then(() => {
      message.success('删除成功')
      const { values, page, selectedRows } = this.state
      const _selectedRows = []
      const _selectedRowKeys = []
      // 过滤已经删除的数据
      selectedRows.forEach((el) => {
        if(record[ rowKey ] !== el[ rowKey ]) {
          _selectedRowKeys.push(el[ rowKey ])
          _selectedRows.push(el)
        }
      })
      this.setState({ selectedRowKeys: _selectedRowKeys, selectedRows: _selectedRows })
      this.getList({ ...values, ...page })
    })
  }
  // 跳转详情
  goToDetail = (record) => {
    const { history: { push } } = this.props
    this.getDetail(record[ rowKey ], ()=>{
      push(`/assetBase/serve/detail?serveId=${ transliteration(record[ rowKey ]) }`)
    })
  }
  // 跳转编辑
  goToEdit = (record) => {
    const { history: { push } } = this.props
    this.getDetail(record[ rowKey ], ()=>{
      push(`/assetBase/serve/edit?serveId=${ transliteration(record[ rowKey ]) }`)
    })
    // this.setState({ modalData: { visible: true, title: '服务编辑', data: record } })
  }
  /**
   * 入库提交请求
   * @param businessId { String } 所需入库的部件ID集合
   * @param callback
   */
  queryPutStorage = (businessId, callback) => {
    putStorage({ businessId }).then(() => {
      callback && callback()
      const { values, page } = this.state
      this.getList({ ...values, ...page })
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
  /**
   * 删除部件提交请求
   * @param IDs {Array} 所需删除部件ID集合
   */
  querydelParts = (IDs = []) => {
    batchDelServe({ businessIdList: IDs }).then((res) => {
      message.success(res.body)
      const { values, page, selectedRows } = this.state
      const _selectedRows = []
      const _selectedRowKeys = []
      // 过滤已经删除的数据
      selectedRows.forEach((el) => {
        if(!IDs.includes(el[ rowKey ])) {
          _selectedRowKeys.push(el[ rowKey ])
          _selectedRows.push(el)
        }
      })
      this.setState({ selectedRowKeys: _selectedRowKeys, selectedRows: _selectedRows })
      //删除之后要清空选中的数据
      this.setState({ selectedRowKeys: [], selectedRows: [] })
      this.getList({ ...values, ...page })
    })
  }
  /**
   * 翻页事件
   */
  pageChange = ({ current: currentPage, pageSize }, filter, sorter) => {
    this.setState({ page: { currentPage, pageSize }, sorter })
    const { values } = this.state
    this.getList({ ...values, currentPage, pageSize, sorter })
  }
  /**
   * 获取数据列表
   * @param params {Object} { currentPage, pageSize, service, serviceClasses, isStorage }
   * @param needCache {Boolean} 是否需要缓存
   */
  getList = (params = {}, needCache = true) => {
    const { sorter } = params
    let sortName = void 0
    let sortOrder = void 0
    if(sorter && sorter.order){
      sortName = sorter.columnKey
      sortOrder = SORT_ORDER[sorter.order]
    }
    if(needCache){
      const { shows } = this.state
      this.cacheDataFunc({ ...params, shows })
    }
    getServicesList({ ...params, gmtCreate: void 0, sorter: void 0, sortOrder, sortName }).then((res) => {
      const { items, totalRecords } = res.body || {}
      this.setState({ list: items || [], total: totalRecords })
      // 最后一页数据被删除完时，触发
      this.isGetLastList({ ...res.body, currentPage: params.currentPage })
    })
  }
  // 缓存数据
  cacheDataFunc = (params) => {
    const { supplier, productName, isStorage, version, sysVersion, language, pageSize, currentPage, beginTime, endTime, sorter, shows } = params
    let sortName = void 0
    let sortOrder = void 0
    if(sorter && sorter.order){
      sortName = sorter.columnKey
      sortOrder = SORT_ORDER[sorter.order]
    }
    cache.cacheSearchParameter([{  parameter: { shows, supplier, productName, isStorage, version, sysVersion, language, gmtCreate: [ beginTime, endTime], sortName, sortOrder }, page: { currentPage, pageSize } }], this.props.history)
  }
  /**
   * 点击查询按钮查询事件
   * @param values {Object} { manufacturer, name, status }
   */
  onSubmit = (values = {}) => {
    const { page, sorter } = this.state
    let beginTime  = void 0
    let endTime = void 0
    const [start, end] = values.gmtCreate || []
    if(start){
      beginTime  = start.valueOf()
    }
    if(end){
      endTime = end.valueOf()
    }
    this.setState({ values: { ...values, beginTime, endTime }, page: { currentPage: 1, pageSize: page.pageSize } })
    this.getList({ currentPage: 1, pageSize: page.pageSize, ...values, beginTime, endTime, sorter })
  }
  onReset = () => {
    this.setState({ sorter: {} }, this.onSubmit)
  }
  // 关闭弹窗
  onClose = () => {
    this.setState({ modalData: { visible: false, data: {} } })
  }
  tableHeaderChange = (field) => {
    const { columns, values, page } = this.state
    const _columns = columns.map((e)=>{
      if( e.dataIndex === field.dataIndex){
        return { ...e, isShow: !field.isShow }
      }
      return e
    })
    const shows = _columns.map(e=>e.isShow)
    this.cacheDataFunc({ ...values, ...page, shows })
    this.setState({ columns: _columns, shows })
  }
  render () {
    const { page, toLead, total, list, selectedRowKeys, selectedRows, columns, sorter } = this.state
    const importData = {
      title: '导入服务',
      visible: toLead,
      width: 650,
      loading: false,
      downloadUrl: '/api/v1/hardsoftlib/export/template',
      uploadUrl: '/api/v1/sysservicelib/import',
      values: { type: 5 },
      onOk: () => {
        const { values, page: { pageSize } } = this.state
        this.getList({ ...values, currentPage: 1, pageSize })
      },
      onCancel: () => {
        this.setState({ toLead: false })
      }
    }
    const _columns = columns.map((e)=>{
      if(e.dataIndex === sorter.columnKey){
        return { ...e, sortOrder: sorter.order }
      }
      return e
    })
    return (
      <div className="main-table-content asset-parts">
        <Import data={ importData }/>
        <div className="tips">资产知识库严格参照CPE规范进行构建，操作之前请确保对CPE相关规范已有了解</div>
        <div className="search-bar">
          <Search defaultFields={ this.searchFields } searchFrom = {(now) => this.search = now} onSubmit={ this.onSubmit }  onReset={this.onReset}/>
        </div>
        <div className="table-wrap">
          <TableBtns leftBtns={ this.leftBtns } rightBtns={ this.rightBtns }/>
          <Table
            selectedRowKeys={ selectedRowKeys }
            selectedRows={ selectedRows }
            rowKey={ rowKey }
            onSelectRows={ this.onSelectRows }
            columns={ _columns }
            dataSource={ list }
            actions={ this.actions }
            onChange={ this.pageChange }
            hideFieldConfig={{ title: '操作', tableHeaderChange: this.tableHeaderChange }}
            page={ { ...page, total } }/>
        </div>
      </div>
    )
  }
}

export default connect(({ assetServices }) => ({ serveTypes: assetServices.serveTypes }))(Serve)
