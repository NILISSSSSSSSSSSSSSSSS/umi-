import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { withRouter } from 'dva/router'
import { Table, Form, Tabs, message, Icon } from 'antd'
import { getUrlPathLast, analysisUrl } from '@u/common'
import PropTypes from 'prop-types'
import { cloneDeep, chunk, debounce, throttle } from 'lodash'
import { DetailFiedls, TableBtns, CommonModal, WareComp, RelatePortModal } from '@c/index'

const { TabPane } = Tabs

const TAB_BTN = ['添加组件', '添加端口', '添加服务', '添加协议', '添加服务']
const DEL_MSGS = ['关联的组件', '依赖的端口', '依赖的服务', '依赖的协议', '提供的服务']
const MODAL_INTERFACE = ['sohardwareAddCompList', '', 'softwareAddListLation', 'softwareAddListProtocol', 'softwareAddListLib']

@withRouter
@Form.create()
class TableChange extends PureComponent {
  state={
    businessId: analysisUrl(this.props.location.search).id,
    currentPage: 1,
    pageSize: this.props.staus !== '2' ? 10 : 30
  }

  static defaultProps={
    bodyList: { items: [], totalRecords: 0 }
  }

  static propTypes={
    bodyList: PropTypes.object
  }

  func=()=>{
    this.props.func()
  }

  pageChange=(currentPage, pageSize)=>{
    const values = {
      businessId: this.state.businessId,
      currentPage,
      pageSize
    }
    this.setState({
      currentPage,
      pageSize
    }, ()=>this.props.pageChangeCB(values))
  }

  render (){
    const { currentPage, pageSize } = this.state
    const { isDetail, columns, bodyList, func, staus, classNameProp } = this.props
    return(
      <div className={classNameProp}>
        {!isDetail && <TableBtns
          leftBtns={ [
            { label: TAB_BTN[staus - 1], onClick: func }
          ]}
        />}
        <Table
          rowKey={(text, recored)=>recored}
          columns={columns}
          dataSource={bodyList.items || []}
          pagination={{
            currentPage,
            pageSize,
            onShowSizeChange: this.pageChange,
            onChange: this.pageChange,
            showQuickJumper: true,
            showSizeChanger: (staus !== '2' && bodyList.totalRecords > 10),
            pageSizeOptions: ['10', '20', '30', '40'],
            showTotal: () => `共 ${bodyList.totalRecords || 0} 条数据`,
            total: bodyList.totalRecords || 0
          }}
        />
      </div>
    )
  }
}

@Form.create()
class SoftwareDetail extends PureComponent {
  state={
    businessId: analysisUrl(this.props.location.search).id,
    tabActiveKey: '1', //tab页面
    //静态数据开始
    soHardwareCompColumnsModel: [],
    portColumnsModel: [],
    depSeriveColumnsModel: [],
    protocolColumnsModel: [],
    proSeriveColumnsModel: [],
    //静态数据结束
    isDetail: false,
    currentStringIds: [],
    deleteVisible: false,
    deleteMsg: null,
    tabNum: null, //切换调用删除接口
    compVisible: false, //添加弹窗
    compPortVisible: false, //添加端口弹窗
    addCompColumns: [], //传入添加弹窗table的Columns
    addCompSearch: [], //传入添加弹窗table的Search
    addCompWareBody: {}, //传入添加弹窗table的list数据
    compTitle: '添加组件'
  }

  static defaultProps ={
  }

  static propTypes={
    softDetailHead: PropTypes.array,
    soHardSearch: PropTypes.array,
    soHardwareCompColumns: PropTypes.array,
    depSeriveSearch: PropTypes.array,
    protocolSearch: PropTypes.array,
    portColumns: PropTypes.array,
    depSeriveColumns: PropTypes.array,
    protocolColumns: PropTypes.array,

    soHardwareDetail: PropTypes.object,
    softwareDetailListComp: PropTypes.object,
    softwareDetailListPort: PropTypes.object,
    softwareDetailListLation: PropTypes.object,
    softwareDetailListProtocol: PropTypes.object,
    softwareDetailListLib: PropTypes.object,

    sohardwareAddCompList: PropTypes.object,
    softwareAddListLation: PropTypes.object,
    softwareAddListProtocol: PropTypes.object,

    softwareSaveComp: PropTypes.number,
    softwareSavePort: PropTypes.number,
    softwareSaveLation: PropTypes.number,
    softwareSaveProtocol: PropTypes.number,
    softwareSaveLib: PropTypes.number,

    softwareDelComp: PropTypes.number,
    softwareDelPort: PropTypes.number,
    softwareDelLation: PropTypes.number,
    softwareDelProtocol: PropTypes.number,
    softwareDelLib: PropTypes.number
  }

  columnsOperating=num=>{
    const operating = {
      title: '操作',
      dataIndex: 'operating',
      key: 'operating',
      render: (record, item)=> (
        <div className="operate-wrap">
          <a onClick={()=>this.deleteFn(true, [item.businessId], num)}>删除</a>
        </div>
      )
    }
    return operating
  }

  //加删除操作
  columnsOperatingPort=(num, i)=>{
    const renderItem = (item) => {
      if(!item) return void(0)
      return (
        <div className="port-item">
          {item.port}
          {!this.state.isDetail && <Icon type="close-circle" onClick={()=>this.deleteFn(true, [item.port], num)} style={{ cursor: 'pointer' }}/>}
        </div>
      )
    }
    const render = (text, item)=>renderItem(item.childrenVal[i])
    return render
  }

  //静态数据初始化
  init=async ()=>{
    const { soHardwareCompColumns, depSeriveColumns, portColumns, protocolColumns } = this.props

    const soHardwareCompColumnsModel = cloneDeep(soHardwareCompColumns)
    const portColumnsModel = cloneDeep(portColumns)
    const depSeriveColumnsModel = cloneDeep(depSeriveColumns)
    const protocolColumnsModel = cloneDeep(protocolColumns)
    const proSeriveColumnsModel = cloneDeep(depSeriveColumns)

    if(!this.state.isDetail){
      soHardwareCompColumnsModel.push(this.columnsOperating('1'))
      depSeriveColumnsModel.push(this.columnsOperating('3'))
      protocolColumnsModel.push(this.columnsOperating('4'))
      proSeriveColumnsModel.push(this.columnsOperating('5'))
    }
    portColumnsModel.forEach((item, i)=>{
      item.render = this.columnsOperatingPort('2', i)
    })

    await this.setState({
      soHardwareCompColumnsModel,
      portColumnsModel,
      depSeriveColumnsModel,
      protocolColumnsModel,
      proSeriveColumnsModel
    })

  }

  tabChange=key=>{
    this.setState({
      tabActiveKey: key
    })
  }

  //动态页面判断
  getIsDetail=()=>{
    return getUrlPathLast(this).indexOf('detail') !== -1 ? true : false
  }

  deleteFn=(deleteVisible, currentStringIds, tabNum = 1)=>{
    const deleteMsg = DEL_MSGS[tabNum - 1]
    this.setState({ deleteVisible, currentStringIds, tabNum, deleteMsg })
  }

  //操作添加组件
  componentFn=(compVisible = true)=>{
    this.setState({ compVisible })
  }

  //操作添加端口组件
  componentPortFn=(compPortVisible = true)=>{
    this.setState({ compPortVisible })
  }

  switchAbstract=(Comp, Port, Lation, Protocol, Lib, value = null)=>{
    switch(this.state.tabActiveKey){
      case '1':
        Comp(value)
        return void(0)
      case '2':
        Port(value)
        return void(0)
      case '3':
        Lation(value)
        return void(0)
      case '4':
        Protocol(value)
        return void(0)
      case '5':
        Lib(value)
        return void(0)
      default:
        break
    }
  }

  //打开添加弹窗
  openAddModal=()=>{
    this.setState({ compTitle: TAB_BTN[this.state.tabActiveKey - 1] })
    this.switchAbstract(
      this.addComp,
      this.addPort,
      this.addDepSerive,
      this.addProtocol,
      this.addProSerive,
    )
    this.state.tabActiveKey !== '2' && this.componentFn(true)
  }

  //删除接口
  deleteEffect=()=>{
    this.deleteFn(false, [])
    this.switchAbstract(
      this.softwareDelComp,
      this.softwareDelPort,
      this.softwareDelLation,
      this.softwareDelProtocol,
      this.softwareDelLib,
    )
  }

  //保存组件
  compEffect=async value=>{
    this.switchAbstract(
      this.softwareSaveComp,
      this.softwareSavePort,
      this.softwareSaveLation,
      this.softwareSaveProtocol,
      this.softwareSaveLib,
      value
    )
  }

  //以下开弹窗
  addComp=()=>{
    const { soHardSearch, soHardwareCompColumns } = this.props
    this.setState({
      addCompSearch: soHardSearch,
      addCompColumns: soHardwareCompColumns
    }, this.sohardwareAddCompList)
  }

  addPort=()=>{
    this.componentPortFn(true)
  }

  addDepSerive= ()=>{
    const { depSeriveSearch, depSeriveColumns } = this.props
    this.setState({
      addCompSearch: depSeriveSearch,
      addCompColumns: depSeriveColumns
    }, this.softwareAddListLation)
  }

  addProtocol=()=>{
    const { protocolSearch, protocolColumns } = this.props
    this.setState({
      addCompSearch: protocolSearch,
      addCompColumns: protocolColumns
    }, this.softwareAddListProtocol)
  }

  addProSerive =()=>{
    const { depSeriveSearch, depSeriveColumns } = this.props
    this.setState({
      addCompSearch: depSeriveSearch,
      addCompColumns: depSeriveColumns
    }, this.softwareAddListLib)
  }

  //保存或删除回调
  saveDelCB=async (data, msg, interFace)=>{
    const payload = {
      businessId: this.state.businessId
    }
    if(this.props[data]){
      message.success(`${msg}成功`)
      await this[interFace](payload)
    }
  }

  /******************************************************副作用开始 **************************************************** */
  // table的list开始
  //组件
  softwareDetailListComp=debounce(async values=>{
    await this.props.dispatch({ type: 'soHardware/softwareDetailListComp', payload: { ...values } })
  }, 300)
  //端口
  softwareDetailListPort=debounce(async values=>{
    values.pageSize = 30
    await this.props.dispatch({ type: 'soHardware/softwareDetailListPort', payload: { ...values } })
  }, 300)
  //依赖服务
  softwareDetailListLation=debounce(async values=>{
    await this.props.dispatch({ type: 'soHardware/softwareDetailListLation', payload: { ...values } })
  }, 300)
  //协议
  softwareDetailListProtocol=debounce(async values=>{
    await this.props.dispatch({ type: 'soHardware/softwareDetailListProtocol', payload: { ...values } })
  }, 300)
  //提供服务
  softwareDetailListLib=debounce(async values=>{
    await this.props.dispatch({ type: 'soHardware/softwareDetailListLib', payload: { ...values } })
  }, 300)
  // table的list结束

  //弹窗list开始
  //组件
  sohardwareAddCompList=debounce(async (payload = {})=>{
    payload.softId = this.state.businessId
    payload.isStorage = 1
    payload.type = 'SOFT'
    await this.props.dispatch({ type: 'soHardware/sohardwareAddCompList', payload })
    this.setState({ addCompWareBody: this.props.sohardwareAddCompList })
  }, 300)
  //端口

  //依赖和提供服务
  softwareAddListLation=debounce(async (payload = {})=>{
    payload.serviceBusinessId = this.state.businessId
    payload.isStorage = 1
    payload.serviceType = 'softwareDepend'
    await this.props.dispatch({ type: 'soHardware/softwareAddListLation', payload })
    this.setState({ addCompWareBody: this.props.softwareAddListLation })
  }, 300)
  //协议
  softwareAddListProtocol=debounce(async (payload = {})=>{
    payload.businessId = this.state.businessId
    payload.isStorage = 1
    payload.sourceType = 'soft'
    await this.props.dispatch({ type: 'soHardware/softwareAddListProtocol', payload })
    this.setState({ addCompWareBody: this.props.softwareAddListProtocol })
  }, 300)
  //提供服务
  softwareAddListLib=debounce(async (payload = {})=>{
    payload.serviceBusinessId = this.state.businessId
    payload.isStorage = 1
    payload.serviceType = 'softwareProvide'
    await this.props.dispatch({ type: 'soHardware/softwareAddListLation', payload })
    this.setState({ addCompWareBody: this.props.softwareAddListLation })
  }, 300)
  //弹窗list结束

  //弹窗保存开始
  //组件
  softwareSaveComp=async otherBusinessIds=>{
    // 获取子组件数据
    await this.props.dispatch({ type: 'soHardware/softwareSaveComp', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds
    } })
    this.saveDelCB('softwareSaveComp', '保存', 'softwareDetailListComp')
  }

  //端口
  softwareSavePort=async ports=>{
    await this.setState({ compPortVisible: false })
    // 获取子组件数据
    await this.props.dispatch({ type: 'soHardware/softwareSavePort', payload: {
      assetBusinessId: this.state.businessId,
      ports
    } })
    this.saveDelCB('softwareSavePort', '保存', 'softwareDetailListPort')
  }

  //依赖服务
  softwareSaveLation=async otherBusinessIds=>{
    await this.props.dispatch({ type: 'soHardware/softwareSaveLation', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds
    } })
    this.saveDelCB('softwareSaveLation', '保存', 'softwareDetailListLation')
  }

  //协议
  softwareSaveProtocol=async otherBusinessIds=>{
    await this.props.dispatch({ type: 'soHardware/softwareSaveProtocol', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds
    } })
    this.saveDelCB('softwareSaveProtocol', '保存', 'softwareDetailListProtocol')
  }

  //提供服务
  softwareSaveLib=async otherBusinessIds=>{
    await this.props.dispatch({ type: 'soHardware/softwareSaveLib', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds
    } })
    this.saveDelCB('softwareSaveLib', '保存', 'softwareDetailListLib')
  }

  //弹窗保存结束

  //弹窗删除开始
  //组件
  softwareDelComp=async ()=>{
    await this.props.dispatch({ type: 'soHardware/softwareDelComp', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds: this.state.currentStringIds
    } })
    this.saveDelCB('softwareDelComp', '删除', 'softwareDetailListComp')
  }
  //端口
  softwareDelPort=async ()=>{
    await this.props.dispatch({ type: 'soHardware/softwareDelPort', payload: {
      assetBusinessId: this.state.businessId,
      ports: this.state.currentStringIds
    } })
    this.saveDelCB('softwareDelPort', '删除', 'softwareDetailListPort')
  }
  //依赖服务
  softwareDelLation=async ()=>{
    await this.props.dispatch({ type: 'soHardware/softwareDelLation', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds: this.state.currentStringIds
    } })
    this.saveDelCB('softwareDelLation', '删除', 'softwareDetailListLation')
  }
  //协议
  softwareDelProtocol=async ()=>{
    await this.props.dispatch({ type: 'soHardware/softwareDelProtocol', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds: this.state.currentStringIds
    } })
    this.saveDelCB('softwareDelProtocol', '删除', 'softwareDetailListProtocol')
  }
  //提供服务
  softwareDelLib=async ()=>{
    await this.props.dispatch({ type: 'soHardware/softwareDelLib', payload: {
      assetBusinessId: this.state.businessId,
      otherBusinessIds: this.state.currentStringIds
    } })
    this.saveDelCB('softwareDelLib', '删除', 'softwareDetailListLib')
  }
  //弹窗删除结束

  render (){
    const {
      tabActiveKey,
      isDetail,
      deleteVisible,
      deleteMsg,
      compVisible,
      compPortVisible,
      addCompColumns,
      addCompSearch,
      addCompWareBody,

      soHardwareCompColumnsModel,
      portColumnsModel,
      depSeriveColumnsModel,
      protocolColumnsModel,
      proSeriveColumnsModel,
      compTitle
    } = this.state
    const {
      softDetailHead,
      soHardwareDetail,
      softwareDetailListComp,
      softwareDetailListPort,
      softwareDetailListLation,
      softwareDetailListProtocol,
      softwareDetailListLib
    } = this.props

    const wareCompInfo = {
      title: compTitle,
      compVisible,
      componentFn: this.componentFn,
      compEffectCB: this.compEffect,
      func: this[MODAL_INTERFACE[tabActiveKey - 1]],
      columns: addCompColumns,
      soHardSearch: addCompSearch,
      wareBody: addCompWareBody
    }

    const softwareDetailListPortModal = cloneDeep(softwareDetailListPort)
    softwareDetailListPortModal.items = chunk(softwareDetailListPortModal.items || [], 3).map((v, i)=>({ idx: i, childrenVal: v }))

    return(
      <div className="main-table-content parts-detail">
        <div className="detail-fields detail-separate">
          <DetailFiedls fields={softDetailHead} data={soHardwareDetail || {}}/>
        </div>

        {soHardwareDetail.type === 'o' ||
          <div className="main-detail-content">
            <Tabs activeKey={tabActiveKey} onChange={this.tabChange}>
              <TabPane tab="软件关联的组件" key="1" forceRender={false}>
                <TableChange isDetail={isDetail} columns={soHardwareCompColumnsModel} bodyList={softwareDetailListComp} pageChangeCB={this.softwareDetailListComp} func={this.openAddModal} staus="1"/>
              </TabPane>
              <TabPane tab="软件依赖的端口" key="2" forceRender={false}>
                <TableChange isDetail={isDetail} classNameProp={'relate-port'} columns={portColumnsModel} bodyList={softwareDetailListPortModal} pageChangeCB={this.softwareDetailListPort} func={this.openAddModal} staus="2"/>
              </TabPane>
              <TabPane tab="软件依赖的服务" key="3" forceRender={false}>
                <TableChange isDetail={isDetail} columns={depSeriveColumnsModel} bodyList={softwareDetailListLation} pageChangeCB={this.softwareDetailListLation} func={this.openAddModal} staus="3"/>
              </TabPane>
              <TabPane tab="软件依赖的协议" key="4" forceRender={false}>
                <TableChange isDetail={isDetail} columns={protocolColumnsModel} bodyList={softwareDetailListProtocol} pageChangeCB={this.softwareDetailListProtocol} func={this.openAddModal} staus="4"/>
              </TabPane>
              <TabPane tab="软件提供的服务" key="5" forceRender={false}>
                <TableChange isDetail={isDetail} columns={proSeriveColumnsModel} bodyList={softwareDetailListLib} pageChangeCB={this.softwareDetailListLib} func={this.openAddModal} staus="5"/>
              </TabPane>
            </Tabs>
          </div>
        }

        <CommonModal
          type="confirm"
          visible={deleteVisible}
          onConfirm={this.deleteEffect}
          onClose={() => this.deleteFn(false, [])}
        >
          <p className="confirm-text">确认删除{deleteMsg}信息？</p>
        </CommonModal>
        {compVisible && <WareComp {...wareCompInfo}/>}
        <RelatePortModal title="添加端口" visible={compPortVisible} onSubmit={this.compEffect} onClose={()=>this.setState({ compPortVisible: false })}/>
      </div>
    )
  }

  async componentDidMount (){
    const isDetail = this.getIsDetail()
    await this.setState({ isDetail })
    await this.init()

    const payload = {
      businessId: this.state.businessId
    }
    await Promise.all([
      this.props.dispatch({ type: 'soHardware/soHardwareDetail', payload  }),
      this.softwareDetailListComp(payload),
      this.softwareDetailListPort(payload),
      this.softwareDetailListLation(payload),
      this.softwareDetailListProtocol(payload),
      this.softwareDetailListLib(payload)
    ])
  }

  componentWillUnmount () {
    this.props.dispatch({ type: 'soHardware/save', payload: {
      softwareDetailListComp: {}
    } })
  }

}

export default connect(({ staticSoHardware, staticSoftware, soHardware }) => ({
  softDetailHead: staticSoHardware.softDetailHead,
  soHardSearch: staticSoHardware.soHardSearch,
  soHardwareCompColumns: staticSoHardware.soHardwareCompColumns,
  portColumns: staticSoftware.portColumns,
  depSeriveColumns: staticSoftware.depSeriveColumns,
  protocolColumns: staticSoftware.protocolColumns,
  depSeriveSearch: staticSoftware.depSeriveSearch,
  protocolSearch: staticSoftware.protocolSearch,

  soHardwareDetail: soHardware.soHardwareDetail,
  //tab列表
  softwareDetailListComp: soHardware.softwareDetailListComp,
  softwareDetailListPort: soHardware.softwareDetailListPort,
  softwareDetailListLation: soHardware.softwareDetailListLation,
  softwareDetailListProtocol: soHardware.softwareDetailListProtocol,
  softwareDetailListLib: soHardware.softwareDetailListLib,
  //弹窗列表
  sohardwareAddCompList: soHardware.sohardwareAddCompList,
  softwareAddListLation: soHardware.softwareAddListLation,
  softwareAddListProtocol: soHardware.softwareAddListProtocol,
  //弹窗保存
  softwareSaveComp: soHardware.softwareSaveComp,
  softwareSavePort: soHardware.softwareSavePort,
  softwareSaveLation: soHardware.softwareSaveLation,
  softwareSaveProtocol: soHardware.softwareSaveProtocol,
  softwareSaveLib: soHardware.softwareSaveLib,
  //列表删除
  softwareDelComp: soHardware.softwareDelComp,
  softwareDelPort: soHardware.softwareDelPort,
  softwareDelLation: soHardware.softwareDelLation,
  softwareDelProtocol: soHardware.softwareDelProtocol,
  softwareDelLib: soHardware.softwareDelLib
}))(SoftwareDetail)

