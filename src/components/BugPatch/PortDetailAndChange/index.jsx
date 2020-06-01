import { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Message } from 'antd'
import DeleteTable from '@c/BugPatch/DeleteTable'
import { CommonModal, TableBtns, RelatePortModal } from '@c/index'
import { TooltipFn, analysisUrl } from '@u/common'
import api from '@/services/api'

class PortDetailAndChange extends Component {
  //type:change为是编辑，detail为详情,from:bug | patch
  static propTypes = {
    type: PropTypes.string,
    from: PropTypes.string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      deleteVisible: false,
      currentStringId: null,
      selectedRowKeys: [],
      body: {},
      total: 0,
      currentPage: 1,
      pageSize: 10,
      addVisible: false,
      modalCurrentPage: 1,
      modalPageSize: 10,
      inputComponent: [1]
    }
  }

  componentDidMount () {
    this.getList(1, 10)
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { body, currentPage, pageSize, deleteVisible, addVisible, selectedRowKeys } = this.state
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
        title: '端口号',
        dataIndex: 'port',
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
            rowKey="stringId"
            body={body}
            rowSelection={rowSelection}
            columns={columns}
            pageSize={pageSize}
            current={currentPage}
            onChange={this.pageChange}
            onDelete={this.onDelete}
            onShowSizeChange={this.pageChange}
            isDelete={isChange}
            isShow={isChange} />
          {
            isChange &&
            <Fragment>
              <CommonModal
                type="confirm"
                visible={deleteVisible}
                onConfirm={this.deletePost}
                onClose={() => this.setState({ deleteVisible: false })}
              >
                <p className="confirm-text">确认删除该端口？</p>
              </CommonModal>
              {
                addVisible && <RelatePortModal
                  title="新增端口"
                  visible={addVisible}
                  onClose={() => this.setState({ addVisible: false })}
                  onSubmit={this.handleSubmit}
                />
              }
            </Fragment>
          }
        </div>
      </Fragment>
    )
  }

  //添加端口
  handleSubmit = (values) => {
    const { id } = this.state
    const { from } = this.props
    let url = 'addPatchPort', type = 'patchIds'
    if (from === 'bug') {
      url = 'addBugPort'
      type = 'antiyVulnId'
      values = values.map(item => {
        return { port: item }
      })
    }
    api[url]({
      [type]: id,
      ports: values
    }).then(response => {
      this.setState({
        addVisible: false,
        selectedRowKeys: [],
        currentStringId: null
      })
      Message.success('添加成功')
      this.getList()
    })
  }

  //提交删除
  deletePost = () => {
    const { selectedRowKeys, currentStringId, id, currentPage, pageSize } = this.state
    const deleteIds = currentStringId ? [currentStringId] : selectedRowKeys
    const { from } = this.props
    const url = from === 'bug' ? 'deleteBugPort' : 'deletePatchPort'
    const type = from === 'bug' ? 'antiyVulnId' : 'patchIds'
    const ids = from === 'bug' ? 'ids' : 'toBeOperatedIds'
    api[url]({
      [type]: id,
      [ids]: deleteIds
    }).then(response => {
      this.setState({
        deleteVisible: false,
        selectedRowKeys: [],
        currentStringId: null
      })
      Message.success('删除成功')
      this.getList(currentPage, pageSize)
    })
  }

  //删除多选
  deleteBatch = (stringId) => {
    const { selectedRowKeys } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    this.setState({
      deleteVisible: true
    })
  }

  //删除弹框显示
  onDelete = (id) => {
    this.setState({ deleteVisible: true, currentStringId: id })
  }

  //分页
  pageChange = (currentPage, pageSize) => {
    this.setState({
      currentPage,
      pageSize
    })
    this.getList(currentPage, pageSize)
  }

  //获取列表
  getList = (currentPage = 1, pageSize = 10) => {
    const { id } = this.state
    const { from } = this.props
    const url = from === 'bug' ? 'getBugPortList' : 'getPatchPortList'
    const type = from === 'bug' ? 'antiyVulnId' : 'antiyPatchNumber'
    const param = {
      [type]: id,
      currentPage,
      pageSize
    }
    api[url](param).then(response => {
      const body = response.body || {}
      if (param.currentPage !== 1 && body.items && body.items.length === 0) {
        this.setState({
          currentPage: param.currentPage - 1,
          pageSize: param.pageSize
        })
        this.getList(currentPage - 1, pageSize)
      } else {
        this.setState({
          body: response.data.body || {}
        })
      }
    })
  }

  //取消
  handleCancel = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      addVisible: false
    })
  }

}

export default withRouter(PortDetailAndChange)
