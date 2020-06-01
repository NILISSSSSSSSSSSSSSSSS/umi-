import React, { PureComponent } from 'react'
import { connect, router } from 'dva'
import { Table, message, Popover, Icon, Checkbox } from 'antd'
import PropTypes from 'prop-types'
import { Search, TableBtns, CommonModal, Import } from '@c/index'  //引入方式
import { transliteration, hasAuth, cache } from '@u/common'
import { cloneDeep, throttle } from 'lodash'
import { WAIT_STORAGE } from '@a/js/enume'
import moment from 'moment'

const { withRouter } = router
const CheckboxGroup = Checkbox.Group

@withRouter
class Ware extends PureComponent {
  state = {
    currentPage: 1,
    pageSize: 10,
    supplier: null,
    productName: null,
    isStorage: null,
    softType: null,
    version: null,
    gmtCreate: null,
    sortName: null,
    sortOrder: null,
    sysVersion: null,
    softVersion: null,
    softPlatform: null,
    hardPlatform: null,
    language: null,
    storageVisible: false, //入库
    deleteVisible: false, //删除
    importVisible: false,
    businessIds: [], //传递给父级id
    selectedRowKeys: [],
    columns: this.props.soHardwareColumns
  };

  static defaultProps ={
    checkExist: 1,
    soHardwareList: { items: [], totalRecords: 0 }
  }
  static propTypes={
    soHardSearchHead: PropTypes.array,
    soHardwareColumns: PropTypes.array,
    //提交接口,重置接口,翻页
    dataFunc: PropTypes.func,
    //列表数据
    soHardwareList: PropTypes.object,
    //提交入库
    storageEffect: PropTypes.func,
    //入库文字
    storageMsg: PropTypes.string,
    //提交删除
    deleteEffect: PropTypes.func,
    //删除文字
    deleteMsg: PropTypes.string,
    //跳转地址
    url: PropTypes.string,
    checkExist: PropTypes.number
  }

  //修改table 头部
  tableHeaderChange = (column) => {
    const columns = cloneDeep(this.state.columns)
    columns.forEach(item => {
      if (item.key === column.key) item.isShow = !item.isShow
    })
    this.setState({ columns }, this.dataCB)
  }

  //提交
  onSubmit = values => {
    this.setState({
      supplier: values.supplier,
      productName: values.productName,
      isStorage: values.isStorage,
      softType: values.softType,
      version: values.version,
      gmtCreate: values.gmtCreate,
      sysVersion: values.sysVersion,
      softVersion: values.softVersion,
      softPlatform: values.softPlatform,
      hardPlatform: values.hardPlatform,
      language: values.language,
      currentPage: 1
    }, this.dataFuncCB)
  }

  //重置 typeName
  onReset=()=>{
    this.setState({
      supplier: null,
      productName: null,
      isStorage: null,
      sortName: null,
      sortOrder: null,
      values: null,
      softType: null,
      version: null,
      gmtCreate: null,
      sysVersion: null,
      softVersion: null,
      softPlatform: null,
      hardPlatform: null,
      language: null,
      currentPage: 1,
      pageSize: 10
    }, this.dataFuncCB)
  }

  //翻页
  pageChange = (currentPage, pageSize)=>{
    this.setState({ currentPage, pageSize }, this.dataFuncCB)
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ businessIds: selectedRowKeys, selectedRowKeys })
  };

  //批量判断
  batchCB=businessIds=>{
    if (businessIds.length === 0) {
      message.info('请先选择数据')
      return true
    }
  }

  //批量入库
  batchStorage=()=>{
    const { businessIds } = this.state
    if(this.batchCB(businessIds)) return void(0)
    this.setState({ storageVisible: true })
  }

  //入库操作
  storageFn=(storageVisible, businessIds)=>{
    this.setState({ storageVisible })
    businessIds && this.setState({ businessIds })
  }

  //批量删除
  batchDelete=()=>{
    const { businessIds } = this.state
    if(this.batchCB(businessIds)) return void(0)
    this.setState({ deleteVisible: true })
  }

  deleteFn=(deleteVisible, businessIds)=>{
    this.setState({ deleteVisible })
    businessIds && this.setState({ businessIds })
  }

  dataCB=()=>{
    const pagingParameter = {
      pageSize: this.state.pageSize,
      currentPage: this.state.currentPage
    }
    const parameter = {
      columns: this.state.columns,
      supplier: this.state.supplier,
      productName: this.state.productName,
      version: this.state.version,
      gmtCreate: this.state.gmtCreate,
      sortName: this.state.sortName,
      sortOrder: this.state.sortOrder,
      isStorage: this.state.isStorage,
      softType: this.state.softType,
      sysVersion: this.state.sysVersion,
      softVersion: this.state.softVersion,
      softPlatform: this.state.softPlatform,
      hardPlatform: this.state.hardPlatform,
      language: this.state.language
    }
    cache.cacheSearchParameter([{
      page: pagingParameter,
      parameter: parameter
    }], this.props.history)
    let gmtCreates = {}
    if (parameter.gmtCreate && parameter.gmtCreate.length > 0) {
      const [beginTime, endTime] = parameter.gmtCreate
      gmtCreates = {
        beginTime: beginTime ? moment(beginTime).startOf('day').valueOf() : null,
        endTime: endTime ? moment(endTime).endOf('day').valueOf() : null
      }
    }
    return {
      ...parameter,
      ...pagingParameter,
      ...gmtCreates

    }
  }

  //调父级接口  导入 提交 重置 翻页
  dataFuncCB=()=>{
    const payload = this.dataCB()
    this.props.dataFunc(payload)
  }

  //调父级接口 入库 删除
  effectCB=()=>{
    const payload = this.dataCB()
    this.props.dataFunc(payload)
  }

  //跳转页面
  jumpCLick=async (url, msg, businessId)=>{
    const isJump = await this.checkExist(businessId)
    if(isJump){
      this.props.history.push(`/assetBase/${url}/${msg}?id=${transliteration(businessId)}`)
    }else{
      message.info('该资产已被删除')
    }
  }

  //表头排序
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      sortName: sorter.columnKey,
      sortOrder: ['asc', 'desc'].filter(v=>(sorter.order || '1').indexOf(v) !== -1)[0] || null
      // isStorage: filters.isStorage ? filters.isStorage[0] : null,
      // softType: filters.typeName ? filters.typeName[0] : null
    }, this.dataFuncCB)
  }

  /***************副作用开始************** */
  //提交入库
  storageEffect=throttle(async ()=>{
    const { businessIds } = this.state
    this.storageFn(false)
    await this.props.storageEffect(businessIds)
    this.effectCB()
  }, 500, { trailing: false })

  //提交删除
  deleteEffect=throttle(async ()=>{
    const { businessIds } = this.state
    this.deleteFn(false)
    await this.props.deleteEffect(businessIds)
    this.effectCB()
    this.setState({ selectedRowKeys: [], businessIds: [] })
  }, 500, { trailing: false })

  //检查数据是否存在
  checkExist=async businessId=>{
    await this.props.dispatch({ type: 'soHardware/checkExist', payload: { businessId } })
    return this.props.checkExist
  }

  render (){
    const {  selectedRowKeys, storageVisible, deleteVisible, currentPage, pageSize, importVisible } = this.state
    const { soHardSearchHead, sohardSenior, soHardwareColumns, soHardwareList, url, storageMsg, deleteMsg, type, perMission: {
      soHaImport,
      entrybase,
      soHadelete,
      edit,
      view
    } } = this.props

    // const columns = cloneDeep(soHardwareColumns)
    const columns = cloneDeep(this.state.columns).filter(item => item.isShow)

    const columnsOperating = {
      title: () => {
        const columns = this.state.columns.slice(0)
        const content = (
          <div className="table-header-select">
            {columns.map(item => {
              if (item.key !== 'operate') {
                return (<Checkbox key={item.key} checked={item.isShow} onClick={() => this.tableHeaderChange(item)}>{item.title}</Checkbox>)
              } else {
                return null
              }
            })}
          </div>
        )
        return (
          <>操作 <Popover getPopupContainer={triggerNode => triggerNode.parentNode} placement="bottomRight" trigger="click" content={content}>
            <Icon type="setting" className="icons" />
          </Popover>
          </>)
      },
      dataIndex: 'operating',
      key: 'operating',
      isShow: true,
      render: (record, item)=> {
        return (
          <div className="operate-wrap">
            {
              hasAuth(entrybase) &&
            (item.isStorage === WAIT_STORAGE.value &&
          <a onClick={()=>{this.storageFn(true, [item.businessId])}}>入库</a>)
            }
            {
              hasAuth(edit) && (type === '2' && item.type === 'o' ||
              <a onClick={() => this.jumpCLick(url, 'edit', item.businessId)}>编辑</a>
              )
            }
            {
              hasAuth(soHadelete) &&
            <a onClick={()=>{this.deleteFn(true, [item.businessId])}}>删除</a>
            }
            {
              hasAuth(view) &&
              <a onClick={() => this.jumpCLick(url, 'detail', item.businessId)}>查看</a>
            }
          </div>
        )
      }
    }

    columns.push(columnsOperating)

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    }

    const importData = {
      title: '导入',
      visible: importVisible,
      width: 650,
      uploadDate: { type },
      downloadUrl: '/api/v1/hardsoftlib/export/template',
      uploadUrl: '/api/v1/hardsoftlib/import',
      loading: false,
      values: { type: type },
      onOk: () => {this.onReset()},
      onCancel: () => {this.setState({ importVisible: false })}
    }

    return(
      <div className="main-table-content">
        <div className="tips">资产知识库严格参照CPE规范进行构建，操作之前请确保对CPE相关规范已有了解</div>
        <div className="search-bar">
          <Search defaultFields={soHardSearchHead} fieldList={sohardSenior} searchFrom={(now) => this.search = now} onSubmit={this.onSubmit} onReset={this.onReset}/>
        </div>
        <div className="table-wrap">
          <TableBtns
            leftBtns={[
              { label: '导入', onClick: () => this.setState({ importVisible: true }), check: ()=>hasAuth(soHaImport) }
            ]}
            rightBtns={[
              { label: '入库', onClick: this.batchStorage, check: ()=>hasAuth(entrybase) },
              { label: '删除', onClick: this.batchDelete, check: ()=>hasAuth(soHadelete) }
            ]}
          />
          <Table
            rowKey='businessId'
            scroll={{ x: true }}
            columns={columns}
            rowSelection={rowSelection}
            dataSource={soHardwareList.items || []}
            onChange={this.handleTableChange}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              showQuickJumper: true,
              showSizeChanger: soHardwareList.totalRecords > 10,
              onShowSizeChange: this.pageChange,
              onChange: this.pageChange,
              pageSizeOptions: ['10', '20', '30', '40'],
              showTotal: () => `共 ${soHardwareList.totalRecords || 0} 条数据`,
              total: soHardwareList.totalRecords || 0
            }}
          />
        </div>

        <CommonModal
          type="confirm"
          visible={storageVisible}
          onConfirm={this.storageEffect}
          onClose={() => this.setState({ storageVisible: false })}
        >
          <p className="confirm-text">确认入库{storageMsg}？</p>
        </CommonModal>
        <CommonModal
          type="confirm"
          visible={deleteVisible}
          onConfirm={this.deleteEffect}
          onClose={() => this.setState({ deleteVisible: false })}
        >
          <p className="confirm-text">确认删除{deleteMsg}，并且删除所有关联关系？</p>
        </CommonModal>
        <Import  data={importData}/>
      </div>
    )
  }

  componentDidMount (){
    const { list } = cache.evalSearchParam(this.search) || {}
    if(list){
      this.setState({
        pageSize: list[0].page.pageSize,
        currentPage: list[0].page.currentPage,
        supplier: list[0].parameter.supplier,
        productName: list[0].parameter.productName,
        isStorage: list[0].parameter.isStorage,
        softType: list[0].parameter.softType,
        sortName: list[0].parameter.sortName,
        sortOrder: list[0].parameter.sortOrder,
        gmtCreate: list[0].parameter.gmtCreate,
        version: list[0].parameter.version,
        sysVersion: list[0].parameter.sysVersion,
        softVersion: list[0].parameter.softVersion,
        softPlatform: list[0].parameter.softPlatform,
        hardPlatform: list[0].parameter.hardPlatform,
        language: list[0].parameter.language,
        columns: list[0].parameter.columns
      }, () => {
        const payload = this.dataCB()
        this.props.dataFunc(payload)
      })
    }else{
      this.props.dataFunc()
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps){
    const { currentPage } = this.state
    //避免最后一页删除后没数据
    if(currentPage !== 1 && nextProps.soHardwareList.items.length === 0){
      this.setState({ currentPage: nextProps.soHardwareList.currentPage }, ()=>{
        const payload = this.dataCB()
        this.props.dataFunc(payload)
      })
    }
  }
  componentWillUnmount () {
    this.props.dispatch({ type: 'soHardware/save', payload: { soHardwareList: {} } })
  }
}

export default connect(({ soHardware }) => ({
  soHardwareList: soHardware.soHardwareList,
  checkExist: soHardware.checkExist
}))(Ware)
