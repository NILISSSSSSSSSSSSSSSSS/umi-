import { Component } from 'react'
import { Table, Pagination, Message, Button, Modal, Icon } from 'antd'
import moment from 'moment'
import { debounce } from 'lodash'
import { Search } from '@c/index'
import { THREAT_GRADE } from '@a/js/enume'
import { TooltipFn, transliteration, hasAuth, getAfterDeletePage, cache } from '@u/common'
import api from '@/services/api'

const { confirm } = Modal
class temporary extends Component {
  constructor (props) {
    super(props)
    this.state = {
      // 当前操作的ID，点击确认弹框时赋值
      currentStringId: null,
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      body: null,
      total: 0,
      values: {},
      selectedRowKeys: []
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
    let { pagingParameter, body, selectedRowKeys } = this.state
    const columns = [
      {
        title: 'CVE编号',
        dataIndex: 'cveId',
        width: '16%',
        render: text => TooltipFn (text)
      },
      {
        title: 'CNNVD编号',
        dataIndex: 'cnnvdId',
        width: '16%',
        render: text => TooltipFn (text)
      },
      {
        title: 'CNVD编号',
        dataIndex: 'cnvdId',
        width: '16%',
        render: text => TooltipFn (text)
      },
      {
        title: '漏洞名称',
        dataIndex: 'vulnName',
        width: '14%',
        render: text => TooltipFn (text)
      },
      {
        title: '危害级别',
        dataIndex: 'warnLevel',
        width: 100,
        render: (text) => {
          return text && THREAT_GRADE.filter(item => item.value === text)[0].name
        }
      },
      {
        title: '发布时间',
        dataIndex: 'publishedDate',
        width: 160,
        render: (text) => {
          return (<span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD') : '--'}</span>)
        }
      },
      {
        title: '操作',
        dataIndex: 'operate',
        width: 200,
        render: (text, record) => {
          const { stringId } = record
          return(
            <div className="operate-wrap">
              { hasAuth('vul:temp:delete') && <a onClick={() => this.handleSigle(stringId)}>迁移</a> }
              { hasAuth('vul:temp:view') && <a onClick={() => this.checkAlive(stringId, `/bug/temporary/detail?id=${transliteration(stringId)}`)}>查看</a> }
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
      { type: 'dateRange', label: '发布时间', placeholder: ['开始时间', '结束时间'], key: 'aTime' },
      { type: 'select', label: '危害级别', placeholder: '请选择', key: 'warnLevel', data: THREAT_GRADE },
      { type: 'input', label: '漏洞名称', placeholder: '请输入', key: 'vulnName', allowClear: true, maxLength: 512 },
      { type: 'input', label: '漏洞编号', placeholder: '请输入CVE、CNNVD、CNVD编号', key: 'number', allowClear: true, maxLength: 64 }
    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    }
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} searchFrom = {(now) => this.search = now} onSubmit={this.onSubmit} onReset={this.onReset} />
        </div>
        {/* 列表+分页 */}
        <div className="table-wrap">
          <div className="table-btn">
            {/* 占位 */}
            <div></div>
            <div className="right-btn">
              { hasAuth('vul:temp:delete') && <Button type="primary" className="btn-left" onClick={this.handleBatch}>迁移</Button> }
            </div>
          </div>
          <Table
            rowKey="stringId"
            onChange={this.handleTableSort}
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
      </div>
    )
  }

  //提交迁移
  movePost = debounce(() => {
    let { selectedRowKeys, currentStringId, values, body, pagingParameter } = this.state
    let { currentPage, pageSize } = pagingParameter
    const moveIds = currentStringId ? [currentStringId] : selectedRowKeys
    const param = { ids: moveIds }
    this.setState({
      currentStringId: null
    })
    api.tempMigrateVul(param).then(response => {
      this.setState({
        selectedRowKeys: []
      })
      Message.success('迁移成功！')
      currentPage = getAfterDeletePage(body.totalRecords - moveIds.length, currentPage, pageSize)
      this.setState({
        pagingParameter: {
          currentPage,
          pageSize
        }
      })
      this.getList({
        currentPage,
        pageSize,
        ...values
      })
    })
  }, 1000, { leading: true, trailing: false })

  //确认操作
  confirm = () => {
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认迁移漏洞信息？',
      okText: '确认',
      onOk: () => {
        this.movePost()
      },
      onCancel: () => {
        this.setState({
          currentStringId: null
        })
      }
    })
  }

  //批量操作
  handleBatch = () => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    this.confirm()
  }

  //单个操作
  handleSigle = (currentStringId) => {
    this.setState({
      currentStringId
    })
    this.confirm()
  }

  //表单查询
  onSubmit = (values) => {
    if(values.aTime && values.aTime.length > 0) {
      const [ beginTime, endTime ] = values.aTime
      values.beginTime = beginTime ? moment(beginTime).startOf('day').valueOf() : null
      values.endTime = endTime ? moment(endTime).endOf('day').valueOf() : null
      delete values.aTime
    }
    const { pagingParameter } = this.state
    this.setState({
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      },
      values,
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
      selectedRowKeys: []
    }, () => {
      this.search.props.form.resetFields()
      cache.clear()
      this.getList(pagingParameter, false)
    })
  }

  //获取列表
  getList = async (param, state = true) => {
    let { pagingParameter, values } = this.state
    values = JSON.parse(JSON.stringify(values))
    const { pageSize, currentPage } = pagingParameter
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
    await api.tempList(param).then(response => {
      const body = response.body || {}
      this.setState({
        body
      })
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
      selectedRowKeys: []
    })
    this.changePage(currentPage, pageSize)
  }

  //查看是否被删除
  checkAlive= (stringId, url) => {
    api.checkTemp({
      stringId
    }).then(response => {
      this.props.history.push(url)
    })
  }
}
export default temporary
