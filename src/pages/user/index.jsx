import { Component, Fragment } from 'react'
import {  Button, Table, Pagination, Tooltip, message } from 'antd'
import { Link } from 'dva/router'
import moment from 'moment'
import { Search } from '@c/index'
import { CommonModal } from '@c/index'
import PasswordForm from '@c/user/PasswordForm'
import api from '@services/user'
import { hasAuth, encrypt, cache } from '@u/common'
export default class UserList extends Component {
  constructor (props) {
    super(props)
    this.state = {
      columns: [
        {
          title: '用户名',
          dataIndex: 'username',
          width: '20%',
          render: (text) => {
            return (
              <Tooltip title={text} placement="topLeft"  getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{text}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '姓名',
          dataIndex: 'name',
          width: '10%',
          render: (text) => {
            return (
              <Tooltip title={text} placement="topLeft"  getPopupContainer={triggerNode => triggerNode.parentNode}>
                <span>{text}</span>
              </Tooltip>
            )
          }
        },
        {
          title: '状态',
          dataIndex: 'status',
          width: '10%',
          render: (status, record) => {
            if(typeof(status) !== 'number' && isNaN(status)) return ''
            return ['禁用', '启用', '锁定'][status]
          }
        },
        {
          title: '创建时间',
          dataIndex: 'gmtCreate',
          width: '16%',
          sorter: true,
          render: timestamp => timestamp <= 0 ? '' : (<span className="tabTimeCss">{moment(timestamp).format('YYYY-MM-DD HH:mm:ss')}</span>)
        },
        {
          title: '操作',
          key: 'operate',
          width: '20%',
          render: (record) => {
            return (
              <div className="operate-wrap">
                {
                  hasAuth('user:view') && <Link to={`/user/detail?id=${record.bh}&type=detail`}>查看</Link>
                } {
                  record.username === 'admin' ? null : (
                    <Fragment>
                      {
                        hasAuth('user:update') && <Link to={`/user/change?id=${record.bh}&type=change`}>变更</Link>
                      }{
                        hasAuth('user:enableforbidden') && (
                          <a onClick={()=>this.userStatusChange(record)}>
                            {record.status === 1 ? '禁用' : '启用' }</a>
                        )
                      }{
                        hasAuth('user:resetpassword') && (
                          <a onClick={()=>{
                            this.setState({ resetPwdModals: true, resetPwdModalId: record.bh })
                          }}>重置密码</a> )
                      }
                    </Fragment>
                  )
                }
              </div>
            )
          }
        }
      ],
      body: {},
      pageSize: 10,
      currentPage: 1,
      sorts: {},
      //重置密码组件通信
      resetPwdModals: false,
      value: {},
      resetPwdModalId: '',
      statusHint: {
        el: '',
        status: null
      },
      userStaus: false,
      SERVE_TYPE: [{
        name: '全部',
        value: null
      }, {
        name: '启用',
        value: 1
      }, {
        name: '锁定',
        value: 2
      }, {
        name: '禁用',
        value: 0
      }]
    }
  }
  componentDidMount () {
    //判断是否存有数据
    let { list } = cache.evalSearchParam(this.search) || {}
    if(list){
      this.setState({
        pageSize: list[0].page.pageSize,
        currentPage: list[0].page.currentPage,
        value: list[0].parameter
      }, () => this.getList(false))
    }else{
      this.getList(false)
    }
  }
  //表单重置
  handleReset = () => {
    cache.removeCriteria()
    this.props.form.resetFields()
    this.setState({
      currentPage: 1,
      pageSize: 10,
      value: {}
    }, ()=> this.getList() )
  }
  //表单查询
  handleSubmit = (res) => {
    console.log('表单', res)
    if(res.aTime && res.aTime.length > 0) {
      const [ beginTime, endTime ] = res.aTime
      res.beginTime = beginTime ? beginTime.valueOf() : null
      res.endTime = endTime ? endTime.valueOf() : null
      if( res.beginTime === res.endTime || res.endTime === moment(res.endTime).startOf('day').valueOf()) res.endTime = moment(new Date()).valueOf()
      delete res.aTime
    }
    this.setState({
      value: res,
      pageSize: 10,
      currentPage: 1
    }, ()=>{
      this.getList()
    })
  }
  //重置密码
  handlePwdReset = (form) => {
    let state = false
    form.validateFields((err, { newPassword }) => {
      if(!err){
        let { resetPwdModalId } = this.state
        form.resetFields()
        this.ModalHandle({
          bh: resetPwdModalId,
          newPassword: encrypt(newPassword)
        }, true, 'resetPwdModals')
        state = true
      }
    })
    return state
  }
  //弹窗 的 请求结果执行
  ModalHandle = (params, sta, type)=>{
    api[ sta ? 'resetPassword' : 'changeUserStatus' ]({ ...params }).then(data=>{
      message.success('操作成功')
      this.setState({ [type]: false })
      this.getList()
    })
  }
  //confirm确认操作
  UserStatusHandle = () => {
    let { resetPwdModalId, statusHint } = this.state
    this.ModalHandle({
      bh: resetPwdModalId,
      status: statusHint.status !== 1 ? 1 : 0
    }, false, 'userStaus' )
  }
  //用户状态切换
  userStatusChange=(param)=>{
    const { status, bh } = param
    const  text = <p className="confirm-text">确认{status === 1 ? '禁用' : '启用' }此用户吗?</p>
    this.setState({
      userStaus: true,
      resetPwdModalId: bh,
      statusHint: {
        el: text,
        status: status
      } })
  }
  //获取列表
  getList = (state = true) => {
    let { pageSize, currentPage, value, sorts  } = this.state
    if (state){
      //缓存时间需要存入数组
      const { beginTime, endTime } = value
      value.aTime = [beginTime, endTime]
      // delete value.beginTime
      // delete value.endTime
      cache.cacheSearchParameter([{
        page: {
          pageSize,
          currentPage
        },
        parameter: { ...value, ...sorts }
      }], this.props.history)
    }
    // value.gmt_create = value.aTime
    delete value.aTime
    console.log({ ...value, pageSize, currentPage, ...sorts })
    api.getUserList({ ...value, pageSize, currentPage, ...sorts }).then(data=>{
      this.setState({
        body: data.body
      })
    })
  }
  //表格排序切换
  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      sorts: {
        sortName: sorter.columnKey,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc'
      },
      currentPage: 1
    }, this.getList)
  }

  //当前页码改变
  changePage = (currentPage, pageSize) => {
    this.setState({ currentPage, pageSize }, ()=>{
      this.getList()
    })
  }
  render () {
    let { currentPage, pageSize,
      body, columns, userStaus, statusHint, resetPwdModals, SERVE_TYPE } = this.state
    const defaultFields = [
      { type: 'input', label: '用户名', placeholder: '请输入', key: 'username', allowClear: true },
      { type: 'input', label: '姓名', placeholder: '请输入', key: 'name', allowClear: true },
      { type: 'select', label: '服务类型', placeholder: '请选择', key: 'status', data: SERVE_TYPE },
      { type: 'dateRange', label: '创建时间', placeholder: ['开始时间', '结束时间'], key: 'aTime', allowClear: true }
    ]
    return (
      <div className="main-table-content system-user-list">
        <div className="search-bar">
          <Search defaultFields={defaultFields} searchFrom = { (now)=> this.search = now } onSubmit={this.handleSubmit}></Search>
        </div>
        <div className="table-wrap">
          <div className="table-btn">
            <div className="left-btn">
              {
                hasAuth('user:add') ? (<Link to='/user/register?type=register'>
                  <Button type="primary">登记</Button>
                </Link>) : null
              }
            </div>
          </div>
          <Table rowKey="bh" columns={columns} dataSource={body.items || [] } pagination={false}  onChange={this.handleTableChange}/>
          {
            body.totalRecords && body.totalRecords > 0 ? (
              <Pagination
                className="table-pagination"
                total={body.totalRecords} showTotal={(total) => `共 ${total} 条数据`}
                showQuickJumper={true}
                showSizeChanger={ body.totalRecords < 10 ? false : true }
                onShowSizeChange={this.changePage}
                onChange={this.changePage}
                pageSize={pageSize}
                current={currentPage} />
            ) : null
          }
        </div>
        <CommonModal
          type="confirm"
          visible={userStaus}
          onConfirm={this.UserStatusHandle}
          children={statusHint.el}
          onClose={() => this.setState({ userStaus: false })}
        >
        </CommonModal>
        <PasswordForm
          title={'重置密码'}
          visible={resetPwdModals}
          onSubmit={(from)=>this.handlePwdReset(from)}
          onClose={()=>this.setState({ resetPwdModals: false })}
        ></PasswordForm>
      </div>
    )
  }
}