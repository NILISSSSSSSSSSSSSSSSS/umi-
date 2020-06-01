import React, { Component } from 'react'
import moment from 'moment'
import { message } from 'antd'
import { withRouter } from 'umi'
import { Search, TableBtns, Table, Import, Tooltip } from '@c/index'  //引入方式
import { emptyFilter, transliteration, hasAuth, cache } from '@u/common'
import { STATUS, NOT_FOUND, WAIT_STORAGE } from '../../../assets/js/enume'
import { getPartList, delPart, partPutStorage, statusDetect } from '@services/parts'
import ACCSS  from '@a/js/access'
import './index.less'
const { assetComponentImport, assetComponentEntrybase, assetComponentDelete, assetComponentEdit, assetComponentView } = ACCSS
const rowKey = 'businessId'
const searchIndex = 0
const SORT_ORDER = {
  ascend: 'asc',
  descend: 'desc'
}
@withRouter
class Parts extends Component {
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
        { dataIndex: 'supplier', isShow: true,  title: '厂商', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
        { dataIndex: 'productName', isShow: true, title: '名称', render: (text)=><Tooltip title={text}>{text}</Tooltip> },
        { dataIndex: 'version', isShow: true, title: '版本' },
        { dataIndex: 'gmtCreate',  sorter: true, sortOrder: undefined,  isShow: true, title: '收录时间', render: (v) =>!v ?  emptyFilter(v) : <div className="tabTimeCss">{moment(v).format('YYYY-MM-DD HH:mm:ss')}</div> },
        { dataIndex: 'isStorage', isShow: true, title: '状态', render: (v) => (STATUS.find(e => Number(e.value) === v) || NOT_FOUND).name },
        { dataIndex: 'sysVersion', isShow: false, title: '系统版本' },
        { dataIndex: 'language', isShow: false, title: '语言' },
        { dataIndex: 'other', isShow: false, title: '其它' }
      ],
      shows: [],
      total: 0,
      toLead: false,
      selectedRowKeys: [],
      selectedRows: [],
      values: {}   // 查询条件
    }
    this.searchFields = [
      { key: 'supplier', label: '厂商', type: 'input', placeholder: '请输入厂商' },
      { key: 'productName', label: '名称', type: 'input', placeholder: '请输入名称' },
      { key: 'version', label: '版本', type: 'input', placeholder: '请输入版本' },
      { key: 'isStorage', label: '状态', data: STATUS, type: 'select' },
      { key: 'gmtCreate', label: '收录时间', type: 'dateRange' }
    ]
    this.fieldsList = [
      { key: 'sysVersion', label: '系统版本', type: 'input', placeholder: '请输入系统版本' },
      { key: 'language', label: '语言', type: 'input', placeholder: '请输入语言' }
    ]
    // 表格上部的左边按钮
    this.leftBtns = [ { label: '导入', check: ()=>hasAuth(assetComponentImport),  onClick: () => {this.setState({ toLead: true })} } ]
    // 表格上部的右边按钮
    this.rightBtns = [
      { label: '入库', check: ()=>hasAuth(assetComponentEntrybase), checkUsable: this.checkUsable, confirm: { onOk: this.volumePutStorageEvent, text: ()=>'确认入库组件？' } },
      // { label: '入库', checkUsable: this.checkUsable, confirm: { onOk: this.volumePutStorageEvent, text: ()=>this.renderBtnConfirmText('是否入库') } },
      // { label: '删除', checkUsable: this.checkUsable, confirm: { onOk: this.delParts, text: ()=>this.renderBtnConfirmText('是否删除') } }
      { label: '删除', check: ()=>hasAuth(assetComponentDelete), checkUsable: this.checkUsable, confirm: { onOk: this.delParts, text: ()=> '确认删除组件,并且删除所有关联关系？' } }
    ]
    // 操作列项
    this.actions  = [
      // { label: '入库', check: (record)=>record.isStorage === WAIT_STORAGE.value, type: 'btn', config: { name: 'productName' }, confirm: { onOk: this.singlePutStorageEvent, text: ()=>this.renderInputBtnConfirmText('是否入库') } },
      { label: '入库', check: (record)=>(record.isStorage === WAIT_STORAGE.value) && hasAuth(assetComponentEntrybase), type: 'btn', config: { name: 'productName' }, confirm: { onOk: this.singlePutStorageEvent, text: ()=>'确认入库组件？' } },
      { label: '编辑', check: ()=>hasAuth(assetComponentEdit), type: 'btn', onClick: this.gotoEdit },
      // { label: '删除', check: true, config: { name: 'productName' }, type: 'btn', confirm: { onOk: this.singledelParts, text: (record)=> `是否删除 ${record.productName} 组件,并且删除所有关联关系？` } },
      { label: '删除', check: ()=>hasAuth(assetComponentDelete), config: { name: 'productName' }, type: 'btn', confirm: { onOk: this.singledelParts, text: (record)=> '确认删除组件,并且删除所有关联关系？' } },
      { label: '查看', check: ()=>hasAuth(assetComponentView), type: 'btn', onClick: this.gotoDetail  }
    ]
  }

  componentDidMount () {
    const { page } = this.state
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
    this.getList(newState, false)
  }
  /**
   * 批量删除的提示语
   * @param text
   * @return {string}
   */
  renderBtnConfirmText = (text) => {
    const { selectedRows } = this.state
    if(selectedRows.length){
      return `${text || ''} ${selectedRows[0].productName}${selectedRows.length > 1 ? ('等' + selectedRows.length + '项组件') : ' 组件'}, 并且删除所有关联关系?`
    }
  }
  /**
   * 渲染批量入库的提示语
   * @param text
   * @return {string}
   */
  renderInputBtnConfirmText = (text) => {
    const { selectedRows } = this.state
    if(selectedRows.length){
      return `${text || ''}${selectedRows[0].productName}${selectedRows.length > 1 ? ('等' + selectedRows.length + '项组件') : ''}?`
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
    const callback = () => {
      //入库之后要清空选中的数据
      this.setState({ selectedRowKeys: [], selectedRows: [] })
    }
    this.queryPutStorage(selectedRowKeys, callback)
  }
  // 单个部件入库事件
  singlePutStorageEvent = (record) => {
    const callback = () => {
      // message.success('入库成功!')
    }
    this.queryPutStorage([record.businessId], callback)
  }
  // 批量删除事件
  delParts = () => {
    const { selectedRowKeys } = this.state
    this.querydelParts(selectedRowKeys, ()=>{
      //入库之后要清空选中的数据
      this.setState({ selectedRowKeys: [], selectedRows: [] })
    })
  }
  /**
   * 删除当前数据事件
   * @param record { Object} 当前操作数据
   */
  singledelParts = (record) => {
    this.querydelParts([record.businessId])
  }
  /**
   * 入库提交请求
   * @param IDS {Array} 所需入库的部件ID集合
   * @param callback
   */
  queryPutStorage = (IDS = [], callback) => {
    partPutStorage({ businessIdList: IDS }).then((res)=>{
      message.success(`${res.body.body.msg || ''}`)
      const { values, page } = this.state
      callback && callback()
      this.getList({ ...values, ...page })
    })
  }
  /**
   * 删除部件提交请求
   * @param IDS {Array} 所需删除部件ID集合
   * @param callback
   */
  querydelParts = (IDS = [], callback) => {
    delPart({ businessIdList: IDS }).then(()=>{
      message.success('删除组件成功')
      callback && callback()
      const { values, page: { currentPage, pageSize }, selectedRows, selectedRowKeys } = this.state
      const _selectedRows = []
      const _selectedRowKeys = []
      // 过滤已经删除的数据
      selectedRows.forEach((el)=>{
        if(!IDS.includes(el[rowKey])){
          _selectedRowKeys.push(el[rowKey])
          _selectedRows.push(el)
        }
      })
      this.setState({ selectedRowKeys: _selectedRowKeys, selectedRows: _selectedRows })
      this.getList({ ...values, currentPage, pageSize })
    })
  }
  /**
   * 是否请求最后一页数据
   */
  isGetLastList  = ({ currentPage, pageSize, totalRecords: total = 0, items } = {}) => {
    const { values } = this.state
    // 第一或者当前有数据时
    if(currentPage === 1 || currentPage === 0 || (items || []).length){
      return
    }
    // 找到最优一页
    const _currentPage = Math.ceil(total / pageSize)
    this.setState({ page: { currentPage: _currentPage, pageSize } })
    this.getList({ ...values, currentPage: _currentPage, pageSize })
  }
  /**
   * 翻页事件
   */
  pageChange = ({ current: currentPage, pageSize }, filter, sorter) => {
    let { values } = this.state
    this.setState({ page: { currentPage, pageSize }, sorter })
    this.getList({ ...values, currentPage, pageSize, sorter })
  }
  /**
   * 获取数据列表
   * @param params {Object} { currentPage, pageSize, supplier, productName, isStorage }
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
    getPartList({ ...params, gmtCreate: void 0, sorter: void 0, sortName, sortOrder }).then((res)=>{
      const { items, totalRecords } = res.body || {}
      this.setState({ list: items || [], total: totalRecords })
      this.isGetLastList({ ...res.body, currentPage: params.currentPage })
    }).catch((e)=>{
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
   * @param values {Object} { supplier, productName, version, sysVersion, language, gmtCreate, status }
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
    this.getList({  ...values, beginTime, endTime, sorter, currentPage: 1, pageSize: page.pageSize })
  }
  onReset = () => {
    this.setState({ sorter: {} }, this.onSubmit)
  }
  /**
   * 获取详情，判断是否存在
   * @param primaryKey
   * @param callback
   */
  getDetail = async (primaryKey, callback) => {
    let init = void (0)
    await statusDetect({ primaryKey }).then(res => {
      init = res.body.status
      if(init){
        callback && callback()
      }
    })
    if(typeof init === 'boolean' && !init){
      const { values, page } = this.state
      message.info('该组件已被删除！')
      this.getList({ ...values, ...page })
    }
  }
  /**
   * 跳转至编辑页面
   * @param record {Object}该条记录数据
   */
  gotoEdit = (record) => {
    const { history: { push } } = this.props
    this.getDetail(record[ rowKey ], ()=>{
      push(`/assetBase/parts/edit?partId=${transliteration(record[rowKey])}`)
    })
  }
  /**
   * 跳转至编辑页面
   * @param record {Object}该条记录数据
   */
  gotoDetail = (record) => {
    const { history: { push } } = this.props
    this.getDetail(record[ rowKey ], ()=>{
      push(`/assetBase/parts/detail?partId=${transliteration(record[rowKey])}`)
    })
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
    const { page, toLead, list, total, selectedRowKeys, selectedRows, columns, sorter } = this.state
    const importData = {
      title: '导入组件',
      visible: toLead,
      width: 650,
      loading: false,
      downloadUrl: '/api/v1/hardsoftlib/export/template',
      uploadUrl: '/api/v1/assemblylib/import',
      values: { type: 3 },
      onOk: ()=>{
        this.setState({ toLead: false })
        const { page: { pageSize }, values } = this.state
        this.getList({  ...values, pageSize, currentPage: 1 })
      },
      onCancel: ()=>{this.setState({ toLead: false })}
    }
    const _columns = columns.map((e)=>{
      if(e.dataIndex === sorter.columnKey){
        return { ...e, sortOrder: sorter.order }
      }
      return e
    })
    return (
      <div className="main-table-content asset-parts">
        <Import  data={importData}/>
        <div className="tips">资产知识库严格参照CPE规范进行构建，操作之前请确保对CPE相关规范已有了解</div>
        <div className="search-bar">
          <Search defaultFields={ this.searchFields } fieldList={this.fieldsList} searchFrom = {(now) => this.search = now} onSubmit={this.onSubmit} onReset={this.onReset}/>
        </div>
        <div className="table-wrap">
          <TableBtns leftBtns={ this.leftBtns } rightBtns={ this.rightBtns }/>
          <Table
            selectedRowKeys={selectedRowKeys}
            selectedRows={selectedRows}
            rowKey={rowKey}
            onSelectRows={ this.onSelectRows }
            columns={ _columns }
            dataSource={ list }
            actions={this.actions}
            onChange={this.pageChange}
            page={{ ...page, total }}
            hideFieldConfig={{ title: '操作', tableHeaderChange: this.tableHeaderChange }}
          />
        </div>
      </div>
    )
  }
}
export default Parts
