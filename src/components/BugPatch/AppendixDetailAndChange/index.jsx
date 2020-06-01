import { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { Message, Table, Pagination, Modal, Icon } from 'antd'
import { string } from 'prop-types'
import debounce from 'lodash/debounce'
import qs from 'qs'
import { TableBtns } from '@c/index'
import AddAppendixForm from '@c/BugPatch/AddAppendixForm'
import { TooltipFn, analysisUrl, transliteration, getAfterDeletePage, createHeaders } from '@u/common'
import api from '@/services/api'

const { confirm } = Modal
@withRouter
class AppendixDetailAndChange extends Component {
  //type:change为是编辑，detail为详情
  static propTypes = {
    type: string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      formVisible: false,
      currentStringId: null,
      selectedRowKeys: [],
      body: {},
      currentPage: 1,
      pageSize: 10
    }
  }

  componentDidMount () {
    this.getList()
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { body, currentPage, pageSize, selectedRowKeys, formVisible } = this.state
    let list  = [], total = 0
    if (body.items){
      list = body.items
      total =  body.totalRecords
    }
    const isDisabled = total === 1
    const rowSelection = isChange ? {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    } : null
    let columns = [
      {
        title: '版本号',
        dataIndex: 'patchVersion',
        render: text => TooltipFn (text)
      },
      {
        title: '附件大小',
        dataIndex: 'fileSize',
        render: text => TooltipFn (text)
      },
      {
        title: '附件名称',
        dataIndex: 'fileName',
        render: text => TooltipFn (text)
      },
      {
        title: '附件MD5码',
        dataIndex: 'fileMd5',
        render: text => TooltipFn (text)
      },
      {
        title: '品类型号名称',
        dataIndex: 'productName',
        render: text => TooltipFn (text)
      },
      {
        title: '附件信息',
        dataIndex: 'fileLink',
        render: (text, record) => {
          return <a>
            <img
              onClick={() => this.down(record)}
              src={require('@a/images/download.svg')} alt="" style={{ width: 22 }} />
          </a>
        }
      },
      {
        title: '原始下载链接',
        dataIndex: 'originalUrl',
        render: text => TooltipFn (text)
      }
    ]
    isChange && columns.push({
      title: '操作',
      dataIndex: 'stringId',
      key: 'stringId',
      width: 180,
      render: (text, record) => {
        const id = record.id
        return (
          <div className="operate-wrap">
            <a className={isDisabled ? 'disable-btn' : null} onClick={() => {this.deleteSigle(id)}} disabled={isDisabled}>删除</a>
          </div>
        )
      }
    })
    return (
      <div className="table-wrap">
        {
          isChange && <TableBtns leftBtns={[
            { label: '新增', onClick: () => this.setState({ formVisible: true }) }
          ]}
          rightBtns={[
            { label: '删除', onClick: this.deleteBatch }
          ]}
          />
        }
        {/* 列表 */}
        <Table
          rowKey="id"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={list}
          pagination={false}
        />
        {/* 分页 */}
        {
          total > 0 && <Pagination className="table-pagination"
            pageSize={pageSize}
            current={currentPage}
            onChange={this.changePage}
            onShowSizeChange={this.changeSize}
            total={total}
            showTotal={(total) => `共 ${total || 0} 条数据`}
            showSizeChanger={total > 10}
            showQuickJumper
          />
        }
        {
          isChange &&
            <Fragment>
              <AddAppendixForm
                visible={formVisible}
                onSubmit={this.handleSubmit}
                onClose={() => this.setState({ formVisible: false })}
              />
            </Fragment>
        }
      </div>
    )
  }

  //提交表单,callBack:子组件回调函数
  handleSubmit = debounce((values, callBack) => {
    const { id } = this.state
    values.antiyPatchNumber = id
    api.insertPatchAttachment(values).then(response => {
      this.setState({
        formVisible: false
      })
      callBack()
      Message.success('新增成功')
      this.setState({
        currentPage: 1,
        pageSize: 10
      })
      this.getList()
    })
  }, 1000, { leading: true, trailing: false })

  //提交删除
  deletePost = debounce(async () => {
    let { body, currentPage, pageSize, selectedRowKeys, currentStringId } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    const param = {
      ids: deleteIds
    }
    await api.deletePatchAttachment(param).then(response => {
      Message.success('删除成功')
      this.setState({
        selectedRowKeys: [],
        currentStringId: null
      })
      const total = body.totalRecords - deleteIds.length
      currentPage = getAfterDeletePage(total, currentPage, pageSize)
    })
    await this.getList(currentPage, pageSize)
    //当获取到列表数据后再更新页码，不然会有显示问题
    this.setState({
      currentPage,
      pageSize
    })
  }, 1000, { leading: true, trailing: false })

  //确认操作
  confirm = (type) => {
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认删除附件信息？',
      okText: '确认',
      onOk: () => {
        this.deletePost()
      },
      onCancel: () => {
        this.setState({
          currentStringId: null
        })
      }
    })
  }

  //删除多选
  deleteBatch = (stringId) => {
    const { selectedRowKeys, body } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    if (selectedRowKeys.length === body.totalRecords) {
      Message.info('不能将附件全部删除！')
      return false
    }
    this.confirm()
  }

  //删除单选
  deleteSigle = (id) => {
    this.setState({ currentStringId: id })
    this.confirm()
  }

  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
    this.getList(currentPage, pageSize)
  }

  changeSize = (currentPage, pageSize) => {
    this.setState({
      selectedRowKeys: []
    })
    this.changePage(currentPage, pageSize)
  }

  //获取列表
  getList = async (currentPage = 1, pageSize = 10) => {
    const { id } = this.state
    const param = {
      antiyPatchNumber: id,
      currentPage,
      pageSize
    }
    await api.getPatchEntityList(param).then(response => {
      const body = response.body || {}
      this.setState({
        body
      })
    })
  }

  //下载
  down = (record) => {
    let params = {
      fileUrl: record.fileLink,
      fileName: transliteration(record.fileName)
    }
    const headers = createHeaders(params) // 把请求参数传入到函数，生成headers
    params = Object.assign(headers, params) // 把请求参数和headers合并，生成新的请求参数
    window.open(`/api/v1/patch/file/download?${qs.stringify(params)}`)
  }
}

export default AppendixDetailAndChange
