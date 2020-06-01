import { Component, Fragment } from 'react'
import { connect } from 'dva'
import { SOURCE_LIST, SOURCE_LEVEL } from '@a/js/enume'
import { TooltipFn, transliteration, hasAuth, cache } from '@u/common'
import { Form, Table, Button, message, Pagination } from 'antd'
import moment from 'moment'
import { debounce } from 'lodash'
import api from '@/services/api'
import {
  Search,
  CommonModal,
  Import
} from '@c/index'  //引入方式

class SettingInformations extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      osList: this.props.osList,
      body: null,
      total: 0,
      values: {},
      deleteVisible: false,
      currentStringId: '',
      sorter: { sortName: '', sortOrder: '', sortOrder2: '' },
      selectedRowKeys: [],
      toLead: false
    }
    this.selectOs = debounce(this.selectOs, 800)
  }
  componentDidMount () {
    //判断是否存有数据
    let { list } = cache.evalSearchParam(this.search) || {}
    if (list) {
      this.setState({ pagingParameter: list[0].page, values: list[0].parameter }, () => this.getList())
    } else {
      this.getList(false, false)
    }
    const payload = {
      productName: ''
    }
    this.props.dispatch({ type: 'baseSetting/getRelationOs', payload })
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
    if (JSON.stringify(this.props.osList) !== JSON.stringify(nextProps.osList)) {
      this.setState({
        osList: nextProps.osList
      })
    }
  }
  render () {
    let { pagingParameter, body, sorter, deleteVisible, selectedRowKeys, toLead, osList } = this.state
    let list = [], total = 0
    if (body) {
      list = body.items
      total = Number(body.totalRecords)
    }
    const columns = [
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        width: '14%',
        render: text => TooltipFn(text)
      },
      {
        title: '编号',
        key: 'ruleId',
        dataIndex: 'ruleId',
        width: '14%',
        render: text => TooltipFn(text)
      },
      {
        title: '来源',
        key: 'source',
        width: '10%',
        dataIndex: 'source',
        render: (text) => {
          if (text) {
            return (<span>{SOURCE_LIST[text - 1].name}</span>)
          } else {
            return <span></span>
          }
        }
      },
      {
        title: '安全级别',
        key: 'level',
        dataIndex: 'level',
        sorter: true,
        width: '10%',
        sortOrder: sorter.sortOrder,
        sortDirections: ['descend', 'ascend'],
        render: (text) => {
          return (text && text !== 4 ? SOURCE_LEVEL[text - 1].name : '--')
        }
      },
      {
        title: '适用系统',
        key: 'osName',
        dataIndex: 'osName',
        width: '14%',
        render: text => TooltipFn(text)
      },
      {
        title: '收录时间',
        key: 'gmtCreate',
        dataIndex: 'gmtCreate',
        sorter: true,
        width: '16%',
        sortOrder: sorter.sortOrder2,
        sortDirections: ['ascend', 'descend'],
        render: text => text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : ''
      },
      {
        title: '操作',
        key: 'operate',
        width: '16%',
        render: (record) => {
          return (
            <div className="operate-wrap">
              <Fragment>
                {
                  hasAuth('config:view') &&
                  <a onClick={() => this.isValid(1, record)}>查看</a>}
                {
                  hasAuth('config:edit') &&
                  <a onClick={() => this.isValid(2, record)}>编辑</a>}
                {hasAuth('config:delete') && <a onClick={() => this.isValid(3, record)}>删除</a>}
              </Fragment>
            </div>
          )
        }
      }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    }
    const defaultFields = [
      { type: 'input', label: '综合查询', placeholder: '请输入基准项名称、编号', key: 'blurQueryField', allowClear: true, maxLength: 30 },
      { type: 'dateRange', label: '收录时间', placeholder: ['开始时间', '结束时间'], key: 'aTime', allowClear: true },
      { type: 'select', multiple: false, label: '安全级别', placeholder: '请输入', key: 'level', data: SOURCE_LEVEL },
      { type: 'select', multiple: false, label: '适用系统', placeholder: '请输入', key: 'os', data: osList, config: { name: 'name', value: 'businessId' }, onSearch: this.selectOs },
      { type: 'select', multiple: false, label: '基准来源', placeholder: '请输入', key: 'source', data: SOURCE_LIST }
    ]
    const importData = {
      title: '导入',
      visible: toLead,
      width: 650,
      downloadUrl: '/api/v1/baseline/downModule',
      uploadUrl: '/api/v1/baseline/import',
      values: null,
      onOk: () => {
        this.handleReset()
      },
      onCancel: () => { this.setState({ toLead: false }) }
    }
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} searchFrom={(now) => this.search = now} onSubmit={this.handleSubmit} onReset={this.handleReset} />
        </div>
        {/* 列表+分页 */}
        <div className="table-wrap">
          <div className="table-btn">
            {/* 导出按钮 */}
            <div className="left-btn">
              {hasAuth('config:checkin') && <Button type="primary" className="btn-left" onClick={() => this.props.history.push('/setting/register')}>登记</Button>}
              {hasAuth('config:import') && <Button type="primary" className="btn-left" onClick={this.importAsset}>导入</Button>}
            </div>
            <div className="right-btn">
              {hasAuth('config:delete') && <Button type="primary" className="btn-left" onClick={this.checkSure}>删除</Button>}
            </div>
          </div>
          <Table rowKey="stringId" onChange={this.handleTableChange} columns={columns} dataSource={list} rowSelection={rowSelection} pagination={false}
          />
          {total > 0 && <Pagination
            className="table-pagination"
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10 ? true : false}
            showQuickJumper
            onChange={this.changePage}
            onShowSizeChange={this.changePage}
            pageSize={pagingParameter.pageSize}
            current={pagingParameter.currentPage} />
          }
        </div>
        <CommonModal
          type="confirm"
          visible={deleteVisible}
          title=""
          onConfirm={this.deleteSure}
          onClose={() => { this.setState({ deleteVisible: false }) }}
        >
          <p className="confirm-text">删除该基准项后，将无法找回，确认删除？</p>
        </CommonModal>
        <Import data={importData} />
      </div>
    )
  }
  //查看该基准项是否存在，存在跳转
  checkValid = (index, init, record) => {
    if (init) {
      switch (index) {
        case 1:
          this.props.history.push(`/setting/detail?stringId=${transliteration(record.stringId)}`)
          break
        case 2:
          this.props.history.push(`/setting/edit?stringId=${transliteration(record.stringId)}`)
          break
        case 3:
          this.setState({ deleteVisible: true, currentStringId: record.stringId })
          break
        default:
          break
      }
    } else {
      message.info('该基准项已被删除！')
    }
  }
  //查询存在接口
  isValid = async (index, record) => {
    let init = ''
    await api.checkBaselineStatus({ stringId: record.stringId }).then(res => {
      init = res.body.status
    })
    this.checkValid(index, init, record)
  }
  selectOs = (e) => {
    this.props.dispatch({ type: 'baseSetting/getRelationOs', payload: { productName: e } })
  }
  importAsset = () => {
    this.setState({ toLead: true })
  }
  //验证选中项
  checkSure = () => {
    let { selectedRowKeys } = this.state
    if (!selectedRowKeys.length)
      message.warn('请先选择要删除的基准项')
    else
      this.setState({ deleteVisible: true })
  }
  //确认删除
  deleteSure = () => {
    let { selectedRowKeys, currentStringId } = this.state
    let idList = selectedRowKeys.length ? selectedRowKeys : [currentStringId]
    api.deleteBaseline({ idList: idList }).then(res => {
      message.success('删除成功!')
      this.setState({
        deleteVisible: false,
        selectedRowKeys: [],
        idList: []
      }, () => this.getList())
    })
  }
  //表单重置
  handleReset = () => {
    const pagingParameter = {
      pageSize: 10,
      currentPage: 1
    }
    this.setState({
      values: {},
      sorter: {
        sortOrder: '',
        sortName: ''
      },
      pagingParameter
    }, () => {
      this.getList(false, false)
      this.search.props.form.resetFields()
      cache.clear()
    })
  }
  //表头排序
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      pagingParameter: {
        currentPage: 1,
        pageSize: 10
      },
      sorter: {
        sortName: sorter.columnKey === 'gmtCreate' ? 'gmt_create' : sorter.columnKey,
        sortOrder: sorter.columnKey === 'level' ? sorter.order : '',
        sortOrder2: sorter.columnKey === 'gmtCreate' ? sorter.order : ''
      }
    }, () => {
      this.getList()
    })
  }
  //表单查询
  handleSubmit = (values) => {
    this.getTime(values)
    const { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      },
      values
    }, () => {
      this.getList()
    })
  }
  getTime = (values) => {
    if (values.aTime && values.aTime.length > 0) {
      const [beginTime, endTime] = values.aTime
      values.beginTime = beginTime ? moment(beginTime).startOf('day').valueOf() : null
      values.endTime = endTime ? moment(endTime).endOf('day').valueOf() : null
      delete values.aTime
    }
  }
  //获取列表,isCache:是否缓存分页数据
  getList = (sort = true, isCache = true) => {
    let { values, pagingParameter, sorter } = this.state
    values = JSON.parse(JSON.stringify(values))
    this.getTime(values)
    let param = sort ? { ...pagingParameter, ...values, ...sorter } : { ...pagingParameter }
    param.sortOrder = param.sortOrder ? param.sortOrder : param.sortOrder2
    if (param.sortOrder === 'ascend') {
      param.sortOrder = 'asc'
    } else if (param.sortOrder === 'descend') {
      param.sortOrder = 'desc'
    }
    if (!param.sortOrder) {
      delete param.sortOrder
    }
    if (!param.sortName) {
      delete param.sortName
    }
    delete param.sortOrder2
    if (isCache) {
      //缓存时间需要存入数组
      const { beginTime, endTime } = values
      delete values.beginTime
      delete values.endTime
      cache.cacheSearchParameter([{
        page: pagingParameter,
        parameter: { ...values, ...sorter, aTime: [beginTime, endTime] }
      }], this.props.history)
    }
    api.getBaselineList(param).then(response => {
      if (param.currentPage !== 1 && response.body.items === null) {
        this.setState({
          pagingParameter: {
            currentPage: param.currentPage - 1,
            pageSize: param.pageSize
          }
        })
        this.getList(false)
      } else {
        this.setState({
          body: response.body
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
      this.getList()
    })
  }
}
//映射model内的数据
const mapStateToProps = ({ baseSetting }) => {
  return {
    osList: baseSetting.osList
  }
}
const SettingInformation = Form.create()(SettingInformations)
export default connect(mapStateToProps)(SettingInformation)
