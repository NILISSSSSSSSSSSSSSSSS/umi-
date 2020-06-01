import { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import { Message, Modal, Icon } from 'antd'
import { string } from 'prop-types'
import debounce from 'lodash/debounce'
import DeleteTable from '@c/BugPatch/DeleteTable'
import AddCatgoryModal from '@c/BugPatch/AddCatgoryModal'
import { TableBtns } from '@c/index'
import { TooltipFn, analysisUrl, getAfterDeletePage } from '@u/common'
import api from '@/services/api'

const { confirm } = Modal
@withRouter
class CatgoryDetailAndChange extends Component {
  //type:change为是编辑，detail为详情,from:bug | patch
  static propTypes = {
    type: string,
    from: string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      currentStringId: null,
      selectedRowKeys: [],
      modalBody: {},
      modalValues: {},
      body: {},
      currentPage: 1,
      pageSize: 10,
      addVisible: false,
      modalCurrentPage: 1,
      modalPageSize: 10,
      serveType: []
    }
  }

  componentDidMount () {
    this.getList()
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { body, currentPage, pageSize, addVisible, selectedRowKeys, id } = this.state
    const rowSelection = isChange ? {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys
        })
      }
    } : null
    const columns = [
      {
        title: '厂商',
        dataIndex: 'supplier',
        render: text => TooltipFn (text)
      },
      {
        title: '名称',
        dataIndex: 'productName',
        render: text => TooltipFn (text)
      },
      {
        title: '版本',
        dataIndex: 'version',
        render: text => TooltipFn (text)
      },
      {
        title: '更新信息',
        dataIndex: 'upgradeMsg',
        render: text => TooltipFn (text)
      },
      {
        title: '系统版本',
        dataIndex: 'sysVersion',
        render: text => TooltipFn (text)
      },
      {
        title: '语言',
        dataIndex: 'language',
        render: text => TooltipFn (text)
      },
      {
        title: '软件版本',
        dataIndex: 'softVersion',
        render: text => TooltipFn (text)
      },
      {
        title: '软件平台',
        dataIndex: 'softPlatform',
        render: text => TooltipFn (text)
      },
      {
        title: '硬件平台',
        dataIndex: 'hardPlatform',
        render: text => TooltipFn (text)
      },
      {
        title: '其它',
        dataIndex: 'other',
        render: text => TooltipFn (text)
      }
    ]
    return (
      <Fragment>
        <div className="table-wrap">
          {
            isChange && <TableBtns leftBtns={[
              { label: '新增', onClick: () => this.setState({ addVisible: true }) }
            ]}
            rightBtns={[
              { label: '删除', onClick: this.deleteBatch }
            ]} />
          }
          <DeleteTable
            rowKey="businessId"
            body={body}
            rowSelection={rowSelection}
            columns={columns}
            pageSize={pageSize}
            current={currentPage}
            onChange={this.changePage}
            onShowSizeChange={this.changeSize}
            onDelete={this.deleteSigle}
            isDelete={isChange}
            isShow={isChange} />
          {
            isChange &&
            <Fragment>
              {
                addVisible &&
                <AddCatgoryModal
                  isBug
                  url="getBugCategory"
                  param={{ antiyVulnId: id }}
                  visible={addVisible}
                  onClose={() => this.setState({ addVisible: false })}
                  onConfirm={this.onConfirm} />
              }
            </Fragment>
          }
        </div>
      </Fragment>
    )
  }

  //新增
  onConfirm = debounce((data) => {
    const businessIds = data.map(item => {
      return item.businessId
    })
    const { id } = this.state
    const param = {
      antiyVulnId: id,
      businessIds
    }
    api.saveVulnCpe(param).then(response => {
      Message.success('新增成功！')
      this.setState({
        addVisible: false,
        currentPage: 1
      })
      this.getList()
    })
  }, 1000, { leading: true, trailing: false })

  //提交删除
  deletePost = debounce(async () => {
    let { body, currentPage, pageSize, selectedRowKeys, currentStringId, id } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    await api.deleteVulnCpe({
      antiyVulnId: id,
      businessIds: deleteIds
    }).then(response => {
      this.setState({
        selectedRowKeys: [],
        currentStringId: null
      })
      Message.success('删除成功')
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
      content: '确认删除品类型号？',
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
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    this.confirm()
  }

  //删除单选
  deleteSigle = (id) => {
    this.setState({ currentStringId: id })
    this.confirm()
  }

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

  //获取关联的服务列表
  getList = async (currentPage = 1, pageSize = 10) => {
    const { page } = this.props
    let url
    const { id } = this.state
    const param = {
      currentPage,
      pageSize
    }
    //临时库
    if (page === 'temporary') {
      param.vulnId = id
      url = 'getTempCpe'
    } else {
      param.antiyVulnId = id
      url = 'getVulnCpe'
    }
    await api[url](param).then(response => {
      const body = response.body || {}
      body.items = body.items.filter(item => item)
      this.setState({
        body
      })
    })
  }
}

export default CatgoryDetailAndChange
