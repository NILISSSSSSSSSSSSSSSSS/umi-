import { Component } from 'react'
import { Table, Pagination, Message, Button, Modal, Icon } from 'antd'
import moment from 'moment'
import { debounce } from 'lodash'
import { Search, Import } from '@c/index'
import { CURRENT_STATUS, THREAT_GRADE, HAS_PLAN } from '@a/js/enume'
import { TooltipFn, transliteration, hasAuth, cache, getAfterDeletePage } from '@u/common'
import api from '@/services/api'

const { confirm } = Modal
class formal extends Component {
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
      importVisible: false,
      selectedRowKeys: [],
      gmtSort: null
    }
  }
  componentDidMount () {
    //判断是否存有数据
    const { list } = cache.evalSearchParam(this.search) || {}
    if (list) {
      const { pageSize, currentPage } = list[0].page
      const parameter = list[0].parameter
      const [ beginTime, endTime ] = parameter.aTime
      const [ publishedDateStart, publishedDateEnd ] = parameter.bTime
      this.setState({
        pagingParameter: {
          pageSize,
          currentPage
        },
        values: parameter
      })
      this.getList({ pageSize, currentPage, ...parameter, beginTime, endTime, publishedDateStart, publishedDateEnd }, false)
    } else {
      this.getList(this.state.pagingParameter, false)
    }
  }

  render () {
    let { pagingParameter, body, selectedRowKeys, importVisible, gmtSort } = this.state
    const columns = [
      {
        title: '安天编号',
        dataIndex: 'antiyVulnId',
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
        title: '是否有解决方案',
        dataIndex: 'solved',
        width: 100,
        render: (text) => {
          return text === 1 ? '是' : text === 0 ? '否' : '--'
        }
      },
      {
        title: '当前状态',
        dataIndex: 'warehousingStatus',
        width: '8%',
        render: (text) => {
          return text === 0 ? '待入库' : text === 1 ? '已入库' : '--'
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
        title: '收录时间',
        dataIndex: 'gmtCreate',
        width: 160,
        render: (text) => {
          return (<span className="tabTimeCss">{text ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '--'}</span>)
        },
        sorter: true,
        sortOrder: gmtSort
      },
      {
        title: '操作',
        dataIndex: 'operate',
        width: 200,
        render: (text, record) => {
          const { antiyVulnId, warehousingStatus  } = record
          return(
            <div className="operate-wrap">
              { hasAuth('vul:formal:view') && <a onClick={() => this.checkAlive(antiyVulnId, `/bug/formal/detail?id=${transliteration(antiyVulnId)}`)}>查看</a> }
              { hasAuth('vul:formal:entrybase') && !warehousingStatus && <a onClick={() => this.handleSigle(antiyVulnId, 'inStorage')}>入库</a> }
              { hasAuth('vul:formal:edit') && <a onClick={() => this.checkAlive(antiyVulnId, `/bug/formal/change?id=${transliteration(antiyVulnId)}`)}>编辑</a> }
              { hasAuth('vul:formal:delete') && <a onClick={() => this.handleSigle(antiyVulnId, 'delete')}>删除</a> }
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
      { type: 'dateRange', label: '收录时间', placeholder: ['开始时间', '结束时间'], key: 'aTime' },
      { type: 'dateRange', label: '发布时间', placeholder: ['开始时间', '结束时间'], key: 'bTime' },
      { type: 'select', label: '危害级别', placeholder: '请选择', key: 'warnLevel', data: THREAT_GRADE },
      { type: 'select', label: '当前状态', placeholder: '请选择', key: 'warehousingStatus', data: CURRENT_STATUS },
      { type: 'input', label: '漏洞名称', placeholder: '请输入', key: 'vulnName', allowClear: true, maxLength: 512 },
      { type: 'input', label: '漏洞编号', placeholder: '请输入', key: 'antiyVulnId', allowClear: true, maxLength: 64 },
      { type: 'select', label: '是否有解决方案', placeholder: '请选择', key: 'solved', data: HAS_PLAN }

    ]
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    }
    const importData = {
      title: '导入',
      visible: importVisible,
      width: 650,
      downloadUrl: '/api/v1/vuln/vulninfo/templateDownload',
      uploadUrl: '/api/v1/vuln/vulninfo/import',
      values: null,
      onOk: () => {
        const { values } = this.state
        this.setState({
          pagingParameter: {
            pageSize: pagingParameter.pageSize,
            currentPage: 1
          },
          selectedRowKeys: []
        })
        this.getList({
          pageSize: pagingParameter.pageSize,
          currentPage: 1,
          ...values
        })
      },
      onCancel: ()=>{this.setState({ importVisible: false })}
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
              {hasAuth('vul:formal:import') && <Button type="primary" className="btn-left" onClick={() => this.setState({ importVisible: true })}>导入</Button>}
            </div>
            <div className="right-btn">
              {hasAuth('vul:formal:entrybase') && <Button type="primary" className="btn-left" onClick={() => this.handleBatch('inStorage')}>入库</Button>}
              {hasAuth('vul:formal:delete') && <Button type="primary" className="btn-left" onClick={ () => this.handleBatch('delete')}>删除</Button>}
            </div>
          </div>
          <Table
            rowKey="antiyVulnId"
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
        <Import  data={importData}/>
      </div>
    )
  }

  //提交入库
  inStoragePost = debounce(() => {
    const { selectedRowKeys, currentStringId, values } = this.state
    const inStorageIds = currentStringId ? [currentStringId] : selectedRowKeys
    const param = { vulIds: inStorageIds }
    this.setState({
      currentStringId: null
    })
    api.bugInto(param).then(response => {
      this.setState({
        selectedRowKeys: []
      })
      Message.success(response.body)
      this.getList({
        ...this.state.pagingParameter,
        ...values
      })
    })
  }, 1000, { leading: true, trailing: false })

  //删除提交
  deletePost = debounce(async () => {
    const { selectedRowKeys, currentStringId, values, body, pagingParameter } = this.state
    let { currentPage, pageSize } = pagingParameter
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    const param = { antiyVulIds: deleteIds }
    this.setState({
      currentStringId: null
    })
    await api.deleteBug(param).then(response => {
      Message.success('删除成功！')
      this.setState({
        selectedRowKeys: []
      })
      const total = body.totalRecords - deleteIds.length
      currentPage = getAfterDeletePage(total, currentPage, pageSize)
    })
    await this.getList({
      currentPage,
      pageSize,
      ...values
    })
    //当获取到列表数据后再更新页码，不然会有显示问题
    this.setState({
      pagingParameter: {
        currentPage,
        pageSize
      }
    })
  }, 1000, { leading: true, trailing: false })

  //确认操作
  confirm = (type) => {
    const content = type === 'inStorage' ? '确认入库漏洞信息？' : '确认删除漏洞信息？'
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

  //收录时间排序
  handleTableSort = (pagination, filters, sorter) => {
    const { pagingParameter } = this.state
    this.setState({
      gmtSort: sorter.order,
      pagingParameter: {
        pageSize: pagingParameter.pageSize,
        currentPage: 1
      }
    }, () => {
      const { values, pagingParameter } = this.state
      this.getList({
        ...values,
        ...pagingParameter
      })
    })

  }

  //表单查询
  onSubmit = (values) => {
    if(values.aTime && values.aTime.length > 0) {
      const [ beginTime, endTime ] = values.aTime
      values.beginTime = beginTime ? moment(beginTime).startOf('day').valueOf() : null
      values.endTime = endTime ? moment(endTime).endOf('day').valueOf() : null
      delete values.aTime
    }
    if(values.bTime && values.bTime.length > 0) {
      const [ publishedDateStart, publishedDateEnd ] = values.bTime
      values.publishedDateStart = publishedDateStart ? moment(publishedDateStart).startOf('day').valueOf() : null
      values.publishedDateEnd = publishedDateEnd ? moment(publishedDateEnd).endOf('day').valueOf() : null
      delete values.bTime
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
      gmtSort: null,
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
    let { pagingParameter, values, gmtSort } = this.state
    values = JSON.parse(JSON.stringify(values))
    const { pageSize, currentPage } = pagingParameter
    param.gmtSort = gmtSort === 'ascend' ? 'asc' : gmtSort === 'descend' ? 'desc' : null
    if (state) {
      //缓存时间需要存入数组
      const { beginTime, endTime, publishedDateEnd, publishedDateStart } = param
      delete values.beginTime
      delete values.endTime
      delete values.publishedDateEnd
      delete values.publishedDateStart
      cache.cacheSearchParameter([{
        page: {
          pageSize,
          currentPage
        },
        parameter: {
          ...values,
          aTime: [beginTime, endTime],
          bTime: [publishedDateStart, publishedDateEnd]
        }
      }], this.props.history)
    }
    delete param.aTime
    delete param.bTime
    await api.getBugList(param).then(response => {
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
  checkAlive= (id, url) => {
    api.checkBug({
      antiyVulnId: id
    }).then(response => {
      this.props.history.push(url)
    })
  }
}
export default formal
