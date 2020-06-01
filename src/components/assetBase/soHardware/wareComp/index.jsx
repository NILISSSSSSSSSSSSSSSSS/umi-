import React, { Component }  from 'react'
import { Search, CommonModal } from '@c/index'  //引入方式
import { bool, func, array, object } from 'prop-types'
import { Table, message } from 'antd'
import { cloneDeep } from 'lodash'

class WareComp extends Component {
  state={
    values: {}, //当前页面表单参数
    currentPage: 1,
    pageSize: 10,
    wareColumns: [], //列表
    otherBusinessIds: [], //传给父级的业务主键
    selectedRowKeys: []
  }

  static defaultFields={
    wareBody: { items: [], totalRecords: 0 }
  }

  static propTypes={
    compVisible: bool,
    componentFn: func,
    compEffectCB: func,
    columns: array,
    soHardSearch: array,
    func: func,
    wareBody: object
  }

  init=columns=>{
    const wareColumns = cloneDeep(columns)
    this.setState({ wareColumns, selectedRowKeys: [], otherBusinessIds: [], currentPage: 1, pageSize: 10 })
  }

  //提交
  onSubmit = (values) => {
    this.setState({
      values,
      currentPage: 1,
      pageSize: 10
    }, this.getList)
  }

  //重置
  onReset = ()=>{
    this.setState({
      values: {},
      currentPage: 1,
      pageSize: 10
    }, this.getList)
  }

  //翻页
  pageChange = (currentPage, pageSize)=>{
    this.setState({
      currentPage,
      pageSize
    }, this.getList)
  }

  /***************副作用开始************** */
  // list数据
  getList=()=>{
    const payload = {
      ...this.state.values,
      currentPage: this.state.currentPage,
      pageSize: this.state.pageSize
    }
    this.props.func(payload)
  }

  //保存组件
  compEffect = ()=>{
    const { otherBusinessIds } = this.state
    const { componentFn, compEffectCB } = this.props
    if(otherBusinessIds.length < 1){
      message.info('请选择')
      return void(0)
    }
    componentFn(false)
    compEffectCB(otherBusinessIds)
  }

  onSelectChange = (selectedRowKeys, selectedRows) => {
    this.setState({ otherBusinessIds: selectedRowKeys, selectedRowKeys })
  };

  render (){
    const { wareColumns, currentPage, pageSize, selectedRowKeys } = this.state
    const { compVisible, componentFn, soHardSearch, wareBody, title } = this.props

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange
    }
    return(
      <CommonModal
        type="search"
        visible={compVisible}
        width={1200}
        oktext='保存'
        title={title}
        onConfirm={this.compEffect}
        onClose={()=>componentFn(false)}
      >
        <div className="table-wrap">
          <Search defaultFields={soHardSearch} onSubmit={this.onSubmit} onReset={this.onReset}/>
          <Table
            rowKey='businessId'
            columns={wareColumns}
            rowSelection={rowSelection}
            dataSource={wareBody.items || []}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              onShowSizeChange: this.pageChange,
              onChange: this.pageChange,
              showQuickJumper: true,
              showSizeChanger: wareBody.totalRecords > 10,
              pageSizeOptions: ['10', '20', '30', '40'],
              showTotal: () => `共 ${wareBody.totalRecords || 0} 条数据`,
              total: wareBody.totalRecords || 0
            }}
          />
        </div>
      </CommonModal>
    )
  }

  componentDidMount (){
    const { columns } = this.props
    this.init(columns)
  }

  UNSAFE_componentWillReceiveProps (nextProps){
    if (nextProps.columns && JSON.stringify(this.props.columns) !== JSON.stringify(nextProps.columns)) {
      this.init(nextProps.columns)
    }
  }

}

export default WareComp