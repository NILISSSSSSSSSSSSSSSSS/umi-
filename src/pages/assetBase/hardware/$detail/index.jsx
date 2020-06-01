import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Table, Form, message, Tabs } from 'antd'
import { analysisUrl, getUrlPathLast } from '@u/common'
import PropTypes from 'prop-types'
import { cloneDeep, debounce, throttle } from 'lodash'
import { DetailFiedls, TableBtns, CommonModal, WareComp } from '@c/index'

const { TabPane } = Tabs

@Form.create()
class HardwareDetail extends PureComponent {
  state={
    businessId: analysisUrl(this.props.location.search).id,
    currentPage: 1,
    pageSize: 10,
    isDetail: false,
    deleteVisible: false, //删除
    compVisible: false, //添加组件
    currentStringIds: []
  }

  static defaultProps ={
    hardwareDetailList: { items: [], totalRecords: 0 }
  }

  static propTypes={
    hardDetailHead: PropTypes.array,
    soHardSearch: PropTypes.array,
    soHardwareCompColumns: PropTypes.array,

    soHardwareDetail: PropTypes.object,
    hardwareDetailList: PropTypes.object,
    sohardwareAddCompList: PropTypes.object,
    hardwareDetaliDel: PropTypes.number,
    hardwareSave: PropTypes.number
  }

  //动态页面判断
  getIsDetail=()=>{
    return getUrlPathLast(this).indexOf('detail') !== -1 ? true : false
  }

  //翻页
  pageChange = (currentPage, pageSize)=>{
    this.setState({
      currentPage,
      pageSize
    }, this.hardwareDetailList)
  }

  deleteFn=(deleteVisible, currentStringIds)=>{
    this.setState({ deleteVisible, currentStringIds })
  }

  //操作添加组件
  componentFn=async (compVisible = true)=>{
    if(compVisible) await this.sohardwareAddCompList()
    this.setState({ compVisible })
  }

  /***************副作用开始************** */
  // list数据
  hardwareDetailList=debounce(async ()=>{
    const payload = {
      businessId: this.state.businessId,
      currentPage: this.state.currentPage,
      pageSize: this.state.pageSize
    }
    await this.props.dispatch({ type: 'soHardware/hardwareDetailList', payload })
  }, 300)

  //添加组件list
  sohardwareAddCompList=debounce(async (payload = {})=>{
    payload.hardId = this.state.businessId
    payload.isStorage = 1
    payload.type = 'HARD'
    await this.props.dispatch({ type: 'soHardware/sohardwareAddCompList', payload })
  }, 300)

  //提交删除
  deleteEffect=async ()=>{
    this.deleteFn(false, [])
    await this.props.dispatch({ type: 'soHardware/hardwareDetaliDel', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds: this.state.currentStringIds
    } })
    if(this.props.hardwareDetaliDel){
      message.success('删除成功！')
      this.hardwareDetailList()
    }
  }

  //保存组件
  compEffect=throttle(async otherBusinessIds=>{
    //获取子组件数据
    await this.props.dispatch({ type: 'soHardware/hardwareSave', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds
    } })
    if(this.props.hardwareSave){
      message.success('保存成功！')
      this.hardwareDetailList()
    }
  }, 500, { trailing: false })

  render (){
    const { isDetail, deleteVisible, compVisible, currentPage, pageSize } = this.state
    const {
      hardDetailHead,
      soHardSearch,
      soHardwareCompColumns,
      soHardwareDetail,
      hardwareDetailList,
      sohardwareAddCompList
    } = this.props

    const columns = cloneDeep(soHardwareCompColumns)

    const columnsOperating = {
      title: '操作',
      dataIndex: 'operating',
      key: 'operating',
      render: (record, item)=> (
        <div className="operate-wrap">
          <a onClick={()=>{this.deleteFn(true, [item.businessId])}}>删除</a>
        </div>
      )
    }

    if(!isDetail){
      columns.push(columnsOperating)
    }

    const wareCompInfo = {
      title: '添加组件',
      compVisible,
      componentFn: this.componentFn,
      compEffectCB: this.compEffect,
      func: this.sohardwareAddCompList,
      columns: cloneDeep(soHardwareCompColumns),
      soHardSearch: soHardSearch,
      wareBody: sohardwareAddCompList
    }

    return(
      <div className="main-table-content parts-detail">
        <div className="detail-fields detail-separate">
          <DetailFiedls fields={hardDetailHead} data={soHardwareDetail || {}}/>
        </div>
        <div className="main-detail-content">
          <Tabs>
            <TabPane tab="硬件关联的组件" key="1" forceRender={false}>
              {!isDetail && <TableBtns
                leftBtns={ [
                  { label: '添加组件', onClick: this.componentFn }
                ]}
              />}
              <Table
                rowKey={(text, recored)=>recored}
                columns={columns}
                dataSource={hardwareDetailList.items || []}
                pagination={{
                  currentPage: currentPage,
                  pageSize: pageSize,
                  onShowSizeChange: this.pageChange,
                  onChange: this.pageChange,
                  showQuickJumper: true,
                  showSizeChanger: hardwareDetailList.totalRecords > 10,
                  pageSizeOptions: ['10', '20', '30', '40'],
                  showTotal: () => `共 ${hardwareDetailList.totalRecords} 条数据`,
                  total: hardwareDetailList.totalRecords
                }}
              />
            </TabPane>
          </Tabs>
        </div>
        <CommonModal
          type="confirm"
          visible={deleteVisible}
          onConfirm={this.deleteEffect}
          onClose={() => this.deleteFn(false, [])}
        >
          <p className="confirm-text">确认删除硬件信息？</p>
        </CommonModal>
        {compVisible && <WareComp {...wareCompInfo}/>}
      </div>
    )
  }

  async componentDidMount (){
    const isDetail = this.getIsDetail()
    this.setState({ isDetail })
    const payload = {
      businessId: this.state.businessId
    }
    await Promise.all([
      this.props.dispatch({ type: 'soHardware/soHardwareDetail', payload  }),
      this.hardwareDetailList()
    ])
  }

  componentWillUnmount () {
    this.props.dispatch({ type: 'soHardware/save', payload: { hardwareDetailList: {} } })
  }

}

export default connect(({ staticSoHardware, soHardware }) => ({
  hardDetailHead: staticSoHardware.hardDetailHead,
  soHardSearch: staticSoHardware.soHardSearch,
  soHardwareCompColumns: staticSoHardware.soHardwareCompColumns,

  soHardwareDetail: soHardware.soHardwareDetail,
  hardwareDetailList: soHardware.hardwareDetailList,
  sohardwareAddCompList: soHardware.sohardwareAddCompList,
  hardwareDetaliDel: soHardware.hardwareDetaliDel,
  hardwareSave: soHardware.hardwareSave
}))(HardwareDetail)