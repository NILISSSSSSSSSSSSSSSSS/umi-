
import { Component } from 'react'
import moment from 'moment'
import { Search } from '@c/index'
import { Table, Pagination, message } from 'antd'
import { CommonModal } from '@c/index'
import { removeEmpty, emptyFilter, cache } from '@u/common'
import api from '@/services/api'
import { UPGRADE_METHOD, UPGRADE_STATUS } from '@a/js/enume'
import './style.less'

class UpgradeRecord extends Component {
  constructor (props) {
    super(props)
    this.state = {
      pagingParameter: {
        pageSize: 10,
        currentPage: 1
      },
      values: {},
      list: [],
      total: 0,
      deleteModalVisible: false,
      deleteId: undefined
    }
  }
  componentDidMount () {
    const { list } = cache.evalSearchParam(this.search) || {}
    if (list) {
      const { pageSize, currentPage } = list[0].page
      const parameter = list[0].parameter
      this.setState({
        pagingParameter: {
          pageSize,
          currentPage
        },
        values: parameter
      }, () => {
        this.getList()
      })
    } else {
      this.getList()
    }
  }
  
  getList = () => {
    const { values, pagingParameter } = this.state
    const postParams = {
      ...values,
      ...pagingParameter
    }
    cache.cacheSearchParameter([{
      page: {
        pageSize: pagingParameter.pageSize,
        currentPage: pagingParameter.currentPage
      },
      parameter: {
        ...values,
        time: [values.beginTime, values.endTime]
      }
    }], this.props.history)
    api.getRecordList(postParams).then(response => {
      this.setState({
        list: response.body.items,
        total: response.body.totalRecords
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
      this.getList()
    })
  }
  onSearch = (values) => {
    // 时间
    const timeArr = values.time ? [ ...values.time ] : undefined
    if(timeArr){
      values.beginTime = timeArr[0] ? timeArr[0].valueOf() : ''
      values.endTime = timeArr[1] ? timeArr[1].valueOf() : ''
    }
    delete values.time
    values = removeEmpty(values)
    this.setState({
      pagingParameter: {
        pageSize: this.state.pagingParameter.pageSize,
        currentPage: 1
      },
      values
    }, () => {
      this.getList()
    })
  }
  /**
   * 设置modal是否显示
   * @param  {string} modalVisible   当前设置的modal
   * @param  {boolean} type          是否显示
   */
  setModalVisible = (modalVisible, type) => {
    this.setState({
      [modalVisible]: type
    })
  }
  // 删除
  deleteIt = id => {
    this.setState({
      deleteId: id
    }, () => {
      this.setModalVisible('deleteModalVisible', true)
    })
  }
  // 确定删除
  onConfirm = () => {
    const { deleteId } = this.state
    this.setModalVisible('deleteModalVisible', false)
  }
  // 重新升级
  upgradeIt = id => {
    message.success( '操作成功！')
  }
  render () {
    const { pagingParameter, total, deleteModalVisible, list, values  } = this.state
    const defaultFields = [
      { type: 'dateRange', label: '时间', placeholder: ['开始时间', '结束时间'], key: 'time', data: values.time },
      { type: 'select', label: '升级方式', placeholder: '请选择', key: 'type', data: UPGRADE_METHOD },
      { type: 'select', label: '状态', placeholder: '请选择', key: 'status', data: UPGRADE_STATUS }
    ]
    const columns = [
      {
        title: '升级方式',
        key: 'type',
        dataIndex: 'type',
        render: (text) => {
          return UPGRADE_METHOD.filter(item => item.value === text)[0].name
        }
      },
      {
        title: '版本',
        key: 'version',
        dataIndex: 'version',
        render: (text) => {
          return <span>{emptyFilter(text)}</span>
        }
      },
      {
        title: '状态',
        key: 'result',
        dataIndex: 'result',
        render: (text) => {
          return UPGRADE_STATUS.filter(item => item.value === text)[0].name
        }
      },
      {
        title: '时间',
        key: 'gmtCreate',
        dataIndex: 'gmtCreate',
        width: 200,
        render: (text) => {
          return (<span className="tabTimeCss">{moment(text).format('YYYY-MM-DD HH:mm:ss')}</span>)
        }
      }
      // {
      //   title: '操作',
      //   key: 'operate',
      //   width: '15%',
      //   render: (record) => {
      //     return(
      //       <div className="operate-wrap">
      //         <a onClick={() => {this.upgradeIt(record.id)}}>重新升级</a>
      //         <a onClick={() => {this.deleteIt(record.id)}}>删除</a>
      //       </div>
      //     )
      //   }
      // }
    ]
    return (
      <div className="main-table-content">
        <div className="search-bar">
          <Search defaultFields={defaultFields} searchFrom = {(now) => this.search = now} onSubmit={this.onSearch}/>
        </div>
        {/* 列表+分页 */}
        <div className="table-wrap">
          <Table rowKey="stringId" columns={columns} dataSource={list} pagination={false} />
          {
            total > 0 &&
              <Pagination
                className="table-pagination"
                total={total}
                showTotal={(total) => `共 ${total || 0} 条数据`}
                showSizeChanger
                showQuickJumper
                onChange={this.changePage}
                onShowSizeChange={this.changePage}
                pageSize={pagingParameter.pageSize}
                current={pagingParameter.currentPage} />
          }
        </div>
        <CommonModal
          type="confirm"
          visible={deleteModalVisible}
          onConfirm={this.onConfirm}
          onClose={() => {this.setModalVisible('deleteModalVisible', false)}}
        >
          <p className="confirm-text">删除后将不在列表显示，确认删除？</p>
        </CommonModal>
      </div>
    )
  }
}
export default UpgradeRecord
