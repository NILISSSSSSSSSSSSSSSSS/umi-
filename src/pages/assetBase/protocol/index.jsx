import { PureComponent } from 'react'
import { connect } from 'dva'
import { Search, CommonModal, Import } from '@c/index'
import { TooltipFn, transliteration, hasAuth, cache } from '@u/common'
import { Table, message, Form, Button } from 'antd'
import moment from 'moment'
import { STATUS, NOT_FOUND } from '@a/js/enume'
import api from '@/services/api'

const searchIndex = 0
class Protocol extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      selectedRowKeys: [],
      rowsSelectedList: [],
      inStorageVisible: false,
      deleteVisible: false,
      search: {},
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      toLead: false,
      protocolData: {},
      sorter: { sortName: '',  sortOrder: '' }
    }
  }
  componentDidMount (){
    const { pagingParameter } = this.state
    const cacheData = cache.getCaches(this.search, true, searchIndex)
    let newState = { ...pagingParameter }
    if(cacheData){
      newState = { ...cacheData.page, ...cacheData.parameter }
      this.setState({ pagingParameter: cacheData.page, search: cacheData.parameter })
    }
    this.getProtocolList(newState, false)
  }
  render (){
    let { protocolData, selectedRowKeys, rowsSelectedList, inStorageVisible, deleteVisible, pagingParameter, toLead, search } = this.state
    let list = []
    let totalRecords = 0
    if(protocolData){
      totalRecords = protocolData.totalRecords
      list = protocolData.items
    }
    console.log(totalRecords)
    //搜索框
    const defaultFields = [
      { type: 'input',  key: 'protocolName', label: '协议名称', placeholder: '请输入协议名称', maxLength: 128 },
      { type: 'select', key: 'isStorage', label: '状态', placeholder: '请选择', initialValue: 0, data: STATUS },
      { type: 'input', key: 'linkedVuls', label: '关联漏洞', placeholder: '请输入关联漏洞' },
      { type: 'dateRange', label: '收录时间', placeholder: ['开始时间', '结束时间'], key: 'gmtCreate', allowClear: true }
    ]
    //导入
    const importData = {
      title: '导入',
      visible: toLead,
      width: 650,
      downloadUrl: '/api/v1/hardsoftlib/export/template',
      uploadUrl: '/api/v1/protocol/import',
      values: { type: 4 },
      onOk: ()=>{this.getProtocolList({ currentPage: 1, pageSize: pagingParameter.pageSize, ...search })},
      onCancel: ()=>{this.setState({ toLead: false })}
    }
    //复选框
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        //分页批量操作
        let _rowsSelectedList = [...rowsSelectedList,  ...selectedRows]//把之前选中的和当前选中的列表放一起
        const tmpArr = _rowsSelectedList.map(e=>JSON.stringify(e))//把列表每项转成字符串
        _rowsSelectedList = [ ...new Set(tmpArr) ].map(e=>JSON.parse(e)).filter(e=>selectedRowKeys.includes(e.businessId))// new set()数组去重再转数组，再过滤掉selectedRowKeys=businessId的
        this.setState({
          selectedRowKeys,
          rowsSelectedList: _rowsSelectedList
        })
      }
    }
    //列表
    const columns = [
      { title: '协议名称', dataIndex: 'name', key: 'name', render: text=>TooltipFn(text) },
      { title: '备注', dataIndex: 'memo', key: 'memo', render: text=>TooltipFn(text) },
      { title: '收录时间', dataIndex: 'gmtCreate', key: 'gmtCreate',  sorter: true, render: (text)=>{ return (<div className='tabTimeCss'>{moment(text).format('YYYY-MM-DD HH:mm:ss')}</div> )} },
      { title: '状态', dataIndex: 'isStorage', key: 'isStorage', render: (v) => (STATUS.find(e => Number(e.value) === v) || NOT_FOUND).name },
      { title: '操作', dataIndex: 'operate', key: 'operate', render: (text, record)=>{
        return(
          <div className="operate-wrap">
            {hasAuth('asset:protocol:entrybase') && record.isStorage === 2 && <a onClick={ () => this.isData(record, 'entrybase' )}>入库</a>}
            {hasAuth('asset:protocol:edit') && <a onClick={ () => this.isData(record, 'edit' )}>编辑</a>}
            {hasAuth('asset:protocol:delete') && <a onClick={()=>this.setState({ deleteVisible: true, record })}>删除</a>}
            {hasAuth('asset:protocol:view') && <a onClick={ () => this.isData(record, 'view' )}>查看</a>}
          </div>
        )}
      }
    ]
    return(
      <div className="main-table-content">
        <div className="tips">资产知识库严格参照CPE规范进行构建，操作之前请确保对CPE相关规范已有了解</div>
        <div className="search-bar">
          <Search defaultFields={defaultFields} searchFrom = {(now) => this.search = now} onSubmit={this.onSubmit}/>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            {/* 导出按钮 */}
            <div className="left-btn">
              {hasAuth('asset:protocol:checkin') && <Button type="primary" className="btn-left" onClick={()=>this.props.history.push('/assetBase/protocol/add')}>登记</Button>}
              {hasAuth('asset:protocol:import') && <Button type="primary" className="btn-left" onClick={() => this.setState({ toLead: true })}>导入</Button>}
            </div>
            <div className="right-btn">
              {hasAuth('asset:protocol:entrybase') && <Button type="primary" className="btn-left" onClick={this.showPutStorage}>入库</Button>}
              {hasAuth('asset:protocol:delete') && <Button type="primary" className="btn-left" onClick={this.showDelete}>删除</Button>}
            </div>
          </div>
          <Table rowKey="businessId"
            onChange = {this.pageChange}
            columns = {columns}
            dataSource = {list}
            rowSelection = {rowSelection}
            pagination={ {
              current: pagingParameter.currentPage,
              pageSize: pagingParameter.pageSize,
              showQuickJumper: true,
              //大于10条才显示分页大小选择
              showSizeChanger: totalRecords > 10,
              pageSizeOptions: ['10', '20', '30', '40'],
              showTotal: () => `共 ${totalRecords} 条数据`,
              total: totalRecords
            }}
          />
        </div>
        <CommonModal
          type="confirm"
          visible={inStorageVisible}
          onConfirm={this.okPutStorage}
          onClose={() => this.setState({ inStorageVisible: false, currentStringId: null })}
        >
          <p className="confirm-text">确认入库协议？</p>
        </CommonModal>
        <CommonModal
          type="confirm"
          visible={deleteVisible}
          onConfirm={this.okDelete}
          onClose={() => this.setState({ deleteVisible: false, currentStringId: null })}
        >
          <p className="confirm-text">确认删除协议，并且删除所有关联关系？</p>
        </CommonModal>
        {/* 导入 */}
        <Import  data={importData}/>
      </div>
    )
  }
  //调列表接口
  getProtocolList = (params, needCache = true, ) => {
    const { pageSize, currentPage, isStorage, protocolName, beginTime, endTime, linkedVuls } = params
    needCache && cache.cacheSearchParameter([{ parameter: { isStorage, protocolName, gmtCreate: [ beginTime, endTime],  beginTime, endTime, linkedVuls }, page: { currentPage, pageSize } }], this.props.history)
    api.protocolQueryList(params).then(response => {
      //除第一页，当前数据为空返回上一页
      if (params.currentPage !== 1 && response.data.body.items.length === 0) {
        this.setState({
          pagingParameter: {
            currentPage: params.currentPage - 1,
            pageSize: params.pageSize
          }
        })
        this.getProtocolList({ ...params, currentPage: params.currentPage - 1 })
      } else {
        this.setState({
          protocolData: response.data.body
        })
      }
    })
  }
  //判断此条数据在数据库中是否被删除
  isData = ( record, type ) =>{
    api.queryStatus({ businessId: record.businessId }).then(() => {
      //是否查看详情
      if (type === 'view'){
        this.props.history.push(`/assetBase/protocol/detail?stringId=${transliteration(record.businessId)}`)
        //是否跳转编辑
      } else if( type === 'edit' ){
        this.props.history.push(`/assetBase/protocol/edit?stringId=${transliteration(record.businessId)}`)
        //是否跳出入库弹窗
      } else if (type === 'entrybase') {
        this.setState({ inStorageVisible: true, record })
      }
      //请求不成功刷新页面
    })
  }
  //分页
  pageChange = (pagination, filters, sorter) => {
    let { search } = this.state
    let { current, pageSize } = pagination
    // console.log(pagination)
    this.setState({
      pagingParameter: {
        currentPage: current,
        pageSize
      }
    })
    let sorder
    if(sorter.order === 'ascend' ){
      sorder = 'asc'
    }else if(sorter.order === 'descend' ){
      sorder = 'desc'
    }else{
      sorder = ''
    }
    this.getProtocolList({ currentPage: current, pageSize, ...search, sortOrder: sorder })
  }
  //提交表单
  onSubmit = (values) =>{
    if(values.gmtCreate) values.beginTime =  moment(values.gmtCreate[0]).startOf('day').valueOf()
    if(values.gmtCreate) values.endTime = moment(values.gmtCreate[1]).endOf('day').valueOf()
    delete values.gmtCreate
    let { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        currentPage: 1,
        pageSize: pagingParameter.pageSize
      },
      search: values
    })
    !values.protocolName && delete values.protocolName
    !values.isStorage && delete values.isStorage
    this.getProtocolList({ ...values, currentPage: 1, pageSize: pagingParameter.pageSize })
  }
  //批量入库
  showPutStorage = () => {
    let { selectedRowKeys, rowsSelectedList } = this.state
    //有选中项
    if(rowsSelectedList && selectedRowKeys.length){
      this.setState({ inStorageVisible: true })
    } else {
      message.info('请先选择数据！')
    }
  }
  //确认入库
  okPutStorage = () => {
    let { record, rowsSelectedList, pagingParameter, search } = this.state
    // 有record为表格入库，rowsSelectedList为批量入库
    api.protocolStorage({ businessIdList: record ? [record.businessId] : rowsSelectedList.map((item)=>item.businessId) }).then(response=>{
      record ? this.setState({
        record: undefined,
        inStorageVisible: false
      }) : this.setState({
        selectedRowKeys: [],
        rowsSelectedList: [],
        inStorageVisible: false
      })
      message.info(response.data.body)
      this.getProtocolList({ ...pagingParameter, ...search })
    }).catch((err) => {
      this.setState({
        inStorageVisible: false
      })
    })
  }
  //批量删除
  showDelete = () => {
    let { rowsSelectedList, selectedRowKeys } = this.state
    if(selectedRowKeys && rowsSelectedList && selectedRowKeys.length){
      this.setState({
        deleteVisible: true
      })
    } else {
      message.info('请先选择数据！')
    }
  }
  //确认删除
  okDelete = () => {
    let { record, rowsSelectedList, pagingParameter, selectedRowKeys, search } = this.state
    if(record){
      let currentKey = selectedRowKeys.includes(record.businessId) && selectedRowKeys.filter((item) => {return item !== record.businessId })
      api.protocolDeleteId({ businessIdList: [record.businessId] }).then(() => {
        this.setState({
          record: undefined,
          deleteVisible: false,
          selectedRowKeys: currentKey || []
        }, this.getProtocolList({ ...pagingParameter, ...search }))
        message.info('删除成功！')
      }).catch(()=>{
        this.setState({
          deleteVisible: false
        })
      })
    }else{
      api.protocolDeleteId({ businessIdList: rowsSelectedList.map((item)=>item.businessId) }).then( ()=> {
        this.setState({
          selectedRowKeys: [],
          rowsSelectedList: [],
          deleteVisible: false
        })
        message.info('删除成功！')
        this.getProtocolList({ ...pagingParameter, ...search })
      }).catch(()=>{
        this.setState({
          deleteVisible: false
        })
      })
    }
  }
}
const Protocols = Form.create()(Protocol)

export default connect()(Protocols)