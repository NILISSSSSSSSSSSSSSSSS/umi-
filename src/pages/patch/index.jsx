import { Component } from 'react'
import { Table, Pagination, Message, Button, Modal, Icon } from 'antd'
import moment from 'moment'
import { uniqBy, debounce } from 'lodash'
import { Search, Import } from '@c/index'
import { CURRENT_STATUS } from '@a/js/enume'
import { TooltipFn, transliteration, hasAuth, cache } from '@u/common'
import api from '@/services/api'
import './index.less'

const { confirm } = Modal
class Patch extends Component {
  constructor (props) {
    super(props)
    this.state = {
      //当前操作的ID，点击确认弹框时赋值
      currentStringId: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      total: 0,
      values: {},
      alertVisible: false,
      importVisible: false,
      selectedAllRows: [],
      selectedRowKeys: [],
      //异常提示
      alertData: {}
    }
  }

  componentDidMount () {
    //判断是否存有数据
    const { list } = cache.evalSearchParam(this.search) || {}
    if (list) {
      const { pageSize, currentPage } = list[0].page
      const parameter = list[0].parameter
      const [ beginTime, endTime ] = parameter.aTime
      this.setState({
        pagingParameter: {
          pageSize,
          currentPage
        },
        values: parameter
      })
      this.getList({ pageSize, currentPage, ...parameter, beginTime, endTime }, false)
    } else {
      this.getList(this.state.pagingParameter, false)
    }
  }

  render () {
    let { pagingParameter, body, selectedRowKeys, selectedAllRows, importVisible, alertVisible, alertData } = this.state
    const columns = [
      {
        title: '补丁安天编号',
        dataIndex: 'antiyPatchNumber',
        width: '16%',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁编号',
        dataIndex: 'patchNumber',
        width: '16%',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁名称',
        dataIndex: 'patchName',
        width: '14%',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁等级',
        dataIndex: 'patchLevelName',
        width: 100,
        render: text => TooltipFn (text)
      },
      {
        title: '当前状态',
        dataIndex: 'warehousingStatusName',
        width: '8%'
      },
      {
        title: '补丁发布时间',
        dataIndex: 'patchPublishTime',
        width: 160,
        render: (text) => {
          return (<span className="tabTimeCss">{text && moment(text).format('YYYY-MM-DD')}</span>)
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        width: 200,
        render: (text, record) => {
          const { antiyPatchNumber, warehousingStatus } = record
          return(
            <div className="operate-wrap">
              { hasAuth('patch:view') && <a onClick={() => this.checkAlive(antiyPatchNumber, `/patch/detail?id=${transliteration(antiyPatchNumber)}`)}>查看</a> }
              { hasAuth('patch:entrybase') &&  !warehousingStatus && <a onClick={() => this.handleSigle(antiyPatchNumber, 'inStorage')}>入库</a> }
              { hasAuth('patch:edit') && <a onClick={() => this.checkAlive(antiyPatchNumber, `/patch/change?id=${transliteration(antiyPatchNumber)}`)}>编辑</a> }
              { hasAuth('patch:delete') && <a onClick={() => this.handleSigle(antiyPatchNumber, 'delete')}>删除</a> }
            </div>
          )
        }
      }
    ]
    let list = [], total = 0
    if (body){
      list = body.items
      total = body.totalRecords
    }
    const defaultFields = [
      { type: 'input', label: '补丁安天编号', placeholder: '请输入', key: 'antiyPatchNumber', allowClear: true, maxLength: 64 },
      { type: 'input', label: '补丁编号', placeholder: '请输入', key: 'patchNumber', allowClear: true, maxLength: 64 },
      { type: 'select', label: '当前状态', placeholder: '请选择', key: 'warehousingStatus', data: CURRENT_STATUS },
      { type: 'input', label: '补丁名称', placeholder: '请输入', key: 'patchName', allowClear: true, maxLength: 180 },
      { type: 'dateRange', label: '发布时间', placeholder: ['开始时间', '结束时间'], key: 'aTime' }

    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedAllRows: uniqBy([...selectedAllRows, ...selectedRows], 'antiyPatchNumber')
        })
      }
    }
    const importData = {
      title: '导入',
      visible: importVisible,
      width: 650,
      fileAccept: '.zip',
      downloadUrl: '/api/v1/patch/entity/templateDownload',
      uploadUrl: '/api/v1/patch/entity/import',
      values: null,
      showMsg: '文件后缀必须是.zip格式, 文件大小不得大于4G',
      onOk: () => {
        this.onReset()
      },
      onCancel: () => { this.setState({ importVisible: false }) }
    }
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} searchFrom = {(now) => this.search = now} onSubmit={this.onSubmit} onReset={this.onReset} />
        </div>
        {/* 列表+分页 */}
        <div className="table-wrap">
          <div className="table-btn">
            {/* 导出按钮 */}
            <div className="left-btn">
              {hasAuth('patch:import') && <Button type="primary" className="btn-left" onClick={() => this.setState({ importVisible: true })}>导入</Button>}
            </div>
            <div className="right-btn">
              {hasAuth('patch:entrybase') && <Button type="primary" className="btn-left" onClick={() => this.handleBatch('inStorage')}>入库</Button>}
              {hasAuth('patch:delete') && <Button type="primary" className="btn-left" onClick={ () => this.handleBatch('delete')}>删除</Button>}
            </div>
          </div>
          <Table
            rowKey="antiyPatchNumber"
            rowSelection={rowSelection}
            columns={columns}
            dataSource={list}
            pagination={false} />
          {
            total > 0 && <Pagination
              className="table-pagination"
              total={total}
              showTotal={(total) => `共 ${total || 0} 条数据`}
              showSizeChanger={total > 10}
              showQuickJumper
              onChange={this.changePage}
              onShowSizeChange={this.changeSize}
              pageSize={pagingParameter.pageSize}
              current={pagingParameter.currentPage} />
          }
        </div>
        {/* 导入提示 */}
        <Modal
          title="提示"
          onCancel={() => this.setState({ alertVisible: false })}
          className="over-scroll-modal export-modal"
          visible={alertVisible}
          width={680}
          footer={null}
        >
          <div className="patch-alert">
            <p>
              {
                alertData.success ? <Icon type="check-circle" className="alert-success"/> : <Icon type="close-circle" className="alert-err"/>
              }
              入库数据{alertData.total}条，
              异常数据<span className="alert-err">{alertData.failCount}</span>条，
              正常数据<span className="alert-success">{alertData.successCount}</span>条
            </p>
            <div className="aler-content">
              <div >
                异常提示：
                <span className="alert-err">{alertData.message}</span>
              </div>
              {
                alertData.unMapEntityList && alertData.unMapEntityList.map((item, index) => <p key={item}>补丁安天编号：{item}</p>)
              }
            </div>
            <div className="button-center">
              <div>
                <Button style={{ marginLeft: '8px' }}  type='primary' ghost onClick={() => this.setState({ alertVisible: false })}>返回</Button>
              </div>
            </div>
          </div>
        </Modal>
        <Import data={importData} />
      </div>
    )
  }

  //提交入库
  inStoragePost = debounce(() => {
    const { selectedRowKeys, currentStringId, values } = this.state
    const inStorageIds = currentStringId ? [currentStringId] : selectedRowKeys
    const param = { param: inStorageIds }
    this.setState({
      currentStringId: null
    })
    api.patchInto(param).then(response => {
      this.setState({
        selectedRowKeys: [],
        selectedAllRows: []
      })
      const body = response.body
      //单个入库或者入库成功
      if (currentStringId || body.success || selectedRowKeys.length === 1) {
        let isSuccess = body.success ? 'success' : 'error'
        Message[isSuccess](response.body.message)
      } else {
        //批量入库
        this.setState({
          alertData: body,
          alertVisible: true
        })
      }
      this.getList({
        ...this.state.pagingParameter,
        ...values
      })
    })
  }, 1000, { leading: true, trailing: false })

  //删除提交
  deletePost = debounce(() => {
    const { selectedRowKeys, currentStringId, values } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    const param = { param: deleteIds }
    this.setState({
      currentStringId: null
    })
    api.deletePatch(param).then(response => {
      this.setState({
        selectedRowKeys: [],
        selectedAllRows: []
      })
      Message.success(response.body)
      this.getList({
        ...this.state.pagingParameter,
        ...values
      })
    })
  }, 1000, { leading: true, trailing: false })

  //确认操作
  confirm = (type) => {
    const content = type === 'inStorage' ? '确认入库补丁信息？' : '确认删除补丁信息？'
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content,
      okText: '确认',
      onOk: () => {
        type === 'inStorage' ? this.inStoragePost() : this.deletePost()
      },
      onCancel: () => {
        this.setState({
          currentStringId: null
        })
      }
    })
  }

  //批量操作
  handleBatch = (type) => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    this.confirm(type)
  }

  //单个操作
  handleSigle = (currentStringId, type) => {
    this.setState({
      currentStringId
    })
    this.confirm(type)
  }

  //表单查询
  onSubmit = (values) => {
    if(values.aTime && values.aTime.length > 0) {
      const [ beginTime, endTime ] = values.aTime
      values.beginTime = beginTime ? moment(beginTime).startOf('day').valueOf() : null
      values.endTime = endTime ? moment(endTime).endOf('day').valueOf() : null
      console.log(values)
      delete values.aTime
    }
    const { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      },
      values,
      selectedAllRows: [],
      selectedRowKeys: []
    }, () => {
      this.getList({
        ...this.state.pagingParameter,
        ...values
      })
    })
  }

  //表单重置
  onReset = () => {
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      pagingParameter,
      selectedAllRows: [],
      selectedRowKeys: []
    }, () => {
      this.search.props.form.resetFields()
      cache.clear()
      this.getList(pagingParameter, false)
    })
  }

  //获取列表
  getList = (param, state = true) => {
    let { pagingParameter, values } = this.state
    const { pageSize, currentPage } = pagingParameter
    values = JSON.parse(JSON.stringify(values))
    if (state) {
      //缓存时间需要存入数组
      const { beginTime, endTime } = param
      delete values.beginTime
      delete values.endTime
      cache.cacheSearchParameter([{
        page: {
          pageSize,
          currentPage
        },
        parameter: {
          ...values,
          aTime: [beginTime, endTime]
        }
      }], this.props.history)
    }
    delete param.aTime
    const status = param.warehousingStatus
    //是否入库：由于后端定义为布尔值，需要转换
    param.warehousingStatus = status === 1 ? true : status === 0 ? false : null
    api.getPatcList(param).then(response => {
      const body = response.body || {}
      if (param.currentPage !== 1 && body.items && body.items.length === 0) {
        param.currentPage -= 1
        this.setState({
          pagingParameter: param
        })
        this.getList(param)
      } else {
        this.setState({
          body
        })
      }
    })
  }

  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pagingParameter: {
        pageSize,
        currentPage
      }
    }, () => {
      const { values } = this.state
      const param = {
        currentPage,
        pageSize,
        ...values
      }
      this.getList(param)
    })
  }

  changeSize = (currentPage, pageSize) => {
    this.setState({
      selectedAllRows: [],
      selectedRowKeys: []
    })
    this.changePage(currentPage, pageSize)
  }

  //查看是否被删除
  checkAlive = (id, url) => {
    api.checkPatch({
      param: id
    }).then(response => {
      if (!response.body) {
        this.props.history.push(url)
      } else {
        Message.error('该补丁已被删除！')
      }
    })
  }
}

export default Patch
