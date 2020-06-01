import { PureComponent, Fragment } from 'react'
import { Table, Pagination, Message } from 'antd'
import { uniqBy } from 'lodash'
import { object, func, bool, string } from 'prop-types'
import { Search, CommonModal } from '@c/index'
import api from '@/services/api'
import { TooltipFn } from '@u/common'

class AddCatgoryModal extends PureComponent {
  static propTypes = {
    param: object,
    url: string,
    isBug: bool, //是否为漏洞正式库添加品类型号
    visible: bool,
    single: bool,
    onClose: func,
    onConfirm: func
  }
  state = {
    selectedRowKeys: [],
    selectedAllRows: [],
    body: {},
    currentPage: 1,
    pageSize: 10,
    values: {}
  }
  componentDidMount () {
    this.getList({
      currentPage: 1,
      pageSize: 10
    })
  }
  render () {
    const { pageSize, currentPage, body, selectedRowKeys, selectedAllRows } = this.state
    const { visible, onClose, isBug } = this.props
    let defaultFields = [
      { type: 'input', label: '厂商', placeholder: '请输入', key: 'supplier', allowClear: true },
      { type: 'input', label: '名称', placeholder: '请输入', key: 'productName', allowClear: true }
    ]
    if (isBug) {
      defaultFields.push(...[
        { type: 'input', label: '版本', placeholder: '请输入', key: 'version', allowClear: true },
        { type: 'input', label: '系统版本', placeholder: '请输入', key: 'sysVersion', allowClear: true },
        { type: 'input', label: '软件版本', placeholder: '请输入', key: 'softVersion', allowClear: true },
        { type: 'input', label: '软件平台', placeholder: '请输入', key: 'softPlatform', allowClear: true },
        { type: 'input', label: '硬件平台', placeholder: '请输入', key: 'hardPlatform', allowClear: true }
      ])
    }
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
    let list  = [], total = 0
    if (body.items){
      list = body.items
      total =  body.totalRecords
    }
    const rowSelection = {
      selectedRowKeys,
      onChange: (selectedRowKeys, selectedRows) => {
        this.setState({
          selectedRowKeys,
          selectedAllRows: uniqBy([...selectedAllRows, ...selectedRows], 'businessId')
        })
      }
    }
    return (
      <Fragment>
        <CommonModal
          title="新增品类型号"
          type="search"
          visible={visible}
          width={1200}
          oktext='保存'
          onConfirm={this.onConfirm}
          onClose={onClose}
        >
          <div className="main-table-content">
            <div className="search-bar">
              <Search defaultFields={defaultFields} onSubmit={(values) => this.onSearch(values)} onReset={this.onReset}/>
            </div>
            <div className="table-wrap">
              {/* 列表 */}
              <Table
                rowKey="businessId"
                rowSelection={rowSelection}
                columns={columns}
                dataSource={list}
                pagination={false} />
              {/* 分页 */}
              {
                total > 0 && <Pagination className="table-pagination"
                  style={{ marginBottom: 20 }}
                  pageSize={pageSize}
                  current={currentPage}
                  onChange={this.changePage}
                  onShowSizeChange={this.changePage}
                  total={total}
                  showTotal={(total) => `共 ${total || 0} 条数据`}
                  showQuickJumper />
              }
            </div>
          </div>
        </CommonModal>
      </Fragment>
    )
  }

  //表单查询
  onSearch = (values) => {
    this.setState({
      values,
      currentPage: 1,
      selectedRowKeys: []
    }, () => {
      this.getList({
        currentPage: 1,
        pageSize: 10,
        ...values
      })
    })
  }

  //表单重置
  onReset = () => {
    this.setState({
      values: {},
      currentPage: 1,
      pageSize: 10,
      selectedRowKeys: []
    }, () => {
      this.getList({
        currentPage: 1,
        pageSize: 10
      })
    })
  }

  //获取品类型号列表
  getList = (params) => {
    const { param, url } = this.props
    //漏洞影响品类型号需传的参数
    if (param) {
      Object.assign(params, param)
    }
    api[url](params).then(response => {
      const body = response.body || {}
      this.setState({
        body
      })
    })
  }

  //分页
  changePage = (currentPage, pageSize) => {
    this.setState({
      pageSize,
      currentPage
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

  //确认提交
  onConfirm = () => {
    const { onConfirm, single } = this.props
    const { selectedRowKeys, selectedAllRows } = this.state
    if (selectedRowKeys.length === 0) {
      Message.info('请选择数据！')
      return false
    }
    if (single && selectedRowKeys.length > 1) {
      Message.info('只能选择一个品类型号！')
      return false
    }
    let data = []
    selectedAllRows.forEach(item => {
      if (selectedRowKeys.includes(item.businessId)) {
        data.push(item)
      }
    })
    onConfirm(data)
  }
}
export default AddCatgoryModal

