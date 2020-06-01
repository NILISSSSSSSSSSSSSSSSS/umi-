import { Component, Fragment } from 'react'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import debounce from 'lodash/debounce'
import { Message, Modal, Icon } from 'antd'
import DeleteTable from '@c/BugPatch/DeleteTable'
import EditPlan from '@c/BugPatch/EditPlan'
import { TooltipFn, analysisUrl } from '@u/common'
import './index.less'
import api from '@/services/api'

const { confirm } = Modal
class PlanDetail extends Component {
  //type:change为是编辑，detail为详情
  static propTypes = {
    type: PropTypes.string
  }
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      //当前编辑或删除的解决方案ID
      currentPlanStringId: null,
      addPlanVisible: false,
      body: {},
      //关联方案的全部数据
      AllPlanData: [],
      currentPage: 1,
      pageSize: 10,
      //全量关联补丁列表
      patchs: []
    }
  }

  componentDidMount () {
    this.getBugPlanList()
  }

  render () {
    const { type } = this.props
    const isChange = type === 'change'
    const { addPlanVisible, AllPlanData } = this.state
    return (
      <Fragment>
        <div className="bug-plan">
          {
            isChange && <div className="table-btn add-plan-btn" style={{ padding: 20 }}>
              <span onClick={this.checkAddPlan}>
                <img src={require('@a/images/biaodanxinzeng.svg')} className="plan-icon" alt="" />
              新增方案
              </span>
            </div>
          }
          {
            this.getPlan(AllPlanData)
          }
        </div>
        {
          AllPlanData.length === 0 && !addPlanVisible &&
          <div className="table-wrap">
            <div className="plan-no-data">
              <img src={require('@a/images/noData.svg')} alt=""/>
              <p>暂无数据</p>
            </div>
          </div>
        }
        {
          addPlanVisible && <div id="add-plan"><EditPlan data={{}} savePatchs={this.savePatchs} cancel={this.cancelAddPlan} onSubmit={this.handleSubmit} /></div>
        }
      </Fragment>
    )
  }

  //提交新增、编辑方案表单
  handleSubmit = debounce((values) => {
    const { id, patchs } = this.state
    const isEdit = values.vulnSolutionInfoId
    let url = 'AddBugPlan'
    let text = '新增'
    //漏洞ID
    values.antiyVulnId = id
    if (isEdit) {
      url = 'editBugPlan'
      text = '变更'
    }
    if (values.solutionType === '2') {
      values.relPatchNumbers = patchs
    }
    api[url](values).then(response => {
      //定位到方案顶部
      if (!isEdit) {
        const el = document.getElementById('bug-tabs')
        el.scrollIntoView()
      }
      this.planSuccess(text)
    })
  }, 1000, { leading: true, trailing: false })

  //提交编辑方案的新增补丁
  addPatchSubmit = debounce((vulnSolutionInfoId, patchs, callBack) => {
    const { id } = this.state
    api.addPatchQuery({
      antiyVulnId: id,
      relPatchNumbers: patchs,
      vulnSolutionInfoId
    }).then(response => {
      this.setState({
        addPlanVisible: false
      })
      callBack()
      this.getPatchList(1, 10, vulnSolutionInfoId)
      Message.success('保存成功！')
    })
  }, 1000, { leading: true, trailing: false })

  //编辑或新增方案成功操作
  planSuccess = (text) => {
    this.setState({
      addPlanVisible: false,
      isAddPlan: false
    })
    Message.success(`${text}成功！`)
    this.getBugPlanList()
  }

  //提交删除方案
  deletePlanPost = (stringId) => {
    confirm({
      icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
      content: '确认删除该方案？',
      okText: '确认',
      onOk: debounce(() => {
        const { id } = this.state
        this.setState({
          addPlanVisible: false
        })
        api.deleteBugPlan({
          //漏洞ID
          vulnId: id,
          //方案ID
          stringId
        }).then(response => {
          Message.success('删除成功！')
          this.getBugPlanList()
        })
      }, 1000, { leading: true, trailing: false })
    })
  }

  //单个或批量提交删除补丁列表
  deletePatchPost = debounce(async (vulnSolutionInfoId, deleteIds, callBack) => {
    const { id } = this.state
    await api.bugQueryDelete({
      vulnId: id,
      //方案ID
      vulnSolutionInfoId,
      //补丁编号
      patchNumbers: deleteIds
    }).then(response => {
      Message.success('删除成功')
      //重新获取编辑状态的补丁数据
      callBack()
    })
  }, 1000, { leading: true, trailing: false })

  //获取解决方案
  getPlan = (data) => {
    const { type } = this.props
    const isChange = type === 'change'
    return data.map((item, index) => {
      return item.isEdit ?
        <EditPlan
          key={item.stringId}
          data={item}
          onSubmit={this.handleSubmit}
          savePatchs={this.savePatchs}
          cancel={() => this.cancelEditPlan(item)}
        />
        : (
          <div className="plan-box" key={index}>
            <div className="bug-plan-title">
              <img src={require('@a/images/fangan.svg')} className="plan-icon" alt=""/>
              {item.solutionName}
              {
                isChange &&  <div className="fr">
                  <span className="edit-btn"  onClick={() => this.checkEditPlan(item.stringId) }>
                    <img src={require('@a/images/biaodanbianji.svg')} alt=""/>
                编辑
                  </span>
                  <span className="delete-btn" onClick={() => this.deletePlanPost(item.stringId)}>
                    <img src={require('@a/images/biaodanshanchu.svg')} alt=""/>
                删除
                  </span>
                </div>
              }
            </div>
            <div className="plan-content">
              <div>
                <span>
                  <label>解决方案类型：</label>{item.solutionType === '1' ? '缓解' : item.solutionType === '2' ? '修复' : ''}
                </span>
                <span>
                  <label>是否重启应用：</label>{item.restartSoftware === '1' ? '是' : item.restartSoftware === '2' ? '否' : ''}
                </span>
                <span>
                  <label>是否重启系统：</label>{item.restartSystem === '1' ? '是' : item.restartSystem === '2' ? '否' : ''}
                </span>
              </div>
              <div className="plan-block">
                <label>紧急预案：</label>{item.emerContent}
              </div>
              <div className="plan-block">
                <label>解决方案描述：</label>{item.description}
              </div>
            </div>
            {
              item.solutionType === '2' && this.getTable(item)
            }
          </div>
        )
    })
  }

  //获取表格
  getTable = ({ patchList, stringId }) => {
    const { type } = this.props
    const { pageSize, currentPage  } = patchList
    const isChange = type === 'change'
    const columns = [
      {
        title: '补丁安天编号',
        dataIndex: 'antiyPatchNumber',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁编号',
        dataIndex: 'patchNumber',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁名称',
        dataIndex: 'patchName',
        render: text => TooltipFn (text)
      },
      {
        title: '前置补丁',
        dataIndex: 'prePatchNumber',
        render: text => TooltipFn (text)
      },
      {
        title: '补丁等级',
        dataIndex: 'patchLevelStr',
        render: (text) => {
          return text || '--'
        }
      }
    ]
    return <div className="table-wrap">
      <DeleteTable
        url="/patch/detail"
        rowKey="antiyPatchNumber"
        body={patchList}
        rowSelection={null}
        columns={columns}
        pageSize={pageSize}
        current={currentPage}
        onChange={(currentPage, pageSize) => this.getPatchList(currentPage, pageSize, stringId)}
        isCheck
        showSizeChanger={false}
        isTargetBlank={isChange}
        isShow />
    </div>
  }

  //获取解决方案
  getBugPlanList = () => {
    const { id } = this.state
    api.getBugPlanList({
      antiyVulnId: id
    }).then(response => {
      let body = JSON.parse(JSON.stringify(response.data.body || []))
      //修改方案关联的补丁数据格式
      body.forEach(item => {
        item.isEdit = false
      })
      this.setState({
        AllPlanData: body
      })
    })
  }

  //获取方案关联的补丁列表
  getPatchList = (currentPage, pageSize, stringId) => {
    const param = {
      //方案ID
      solutionId: stringId,
      currentPage,
      pageSize
    }
    api.queryBugPatchPage(param).then(response => {
      const body = response.body || {}
      const { AllPlanData } = this.state
      //查找某个方案下面的补丁列表并更新数据
      const data = JSON.parse(JSON.stringify(AllPlanData))
      for (let i = 0; i < data.length; i++) {
        if (data[i].stringId === stringId) {
          data[i].patchList = body
          break
        }
      }
      this.setState({
        AllPlanData: data
      })
    })
  }

  //保存关联的补丁
  savePatchs = (data) => {
    data = data.map(item => {
      return {
        antiyPatchNumber: item.antiyPatchNumber,
        patchNumber: item.patchNumber
      }
    })
    this.setState({
      patchs: data
    })
  }

  //编辑方案时，检查方案是否处于编辑或新增状态
  checkEditPlan = (id) => {
    const { AllPlanData, addPlanVisible } = this.state
    const plan = AllPlanData.filter(item => item.isEdit)
    if (plan.length > 0 || addPlanVisible) {
      confirm({
        icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
        content: '方案尚未保存，是否继续？',
        okText: '确认',
        onOk: () => {
          this.editPlan(id)
        }
      })
    } else {
      this.editPlan(id)
    }
  }

  //新增方案时，检查方案是否处于编辑状态
  checkAddPlan = () => {
    const { AllPlanData } = this.state
    const plan = AllPlanData.filter(item => item.isEdit)
    if (plan.length > 0) {
      confirm({
        icon: <Icon type="close" onClick={() => { Modal.destroyAll() }} />,
        content: '方案尚未保存，是否继续？',
        okText: '确认',
        onOk: () => {
          this.addPlan()
        }
      })
    } else {
      this.addPlan()
    }
  }

  //编辑方案
  editPlan = (id) => {
    const { AllPlanData } = this.state
    //查找某个方案下面的补丁列表并更新数据
    const data = JSON.parse(JSON.stringify(AllPlanData))
    for (let i = 0; i < data.length; i++) {
      data[i].isEdit = false
      if (data[i].stringId === id) {
        data[i].isEdit = true
      }
    }
    this.setState({
      addPlanVisible: false,
      AllPlanData: data,
      currentPlanStringId: id
    })
  }

  //新增方案
  addPlan = () => {
    const { addPlanVisible } = this.state
    if (addPlanVisible) return false
    this.closeEditPlan()
    this.setState({
      addPlanVisible: true
    }, () => {
      //需要延时才能定位到底部
      setTimeout(() => {
        const el = document.getElementById('add-plan')
        el.scrollIntoView(false)
      }, 0)
    })
  }

  //关闭编辑方案
  closeEditPlan = () => {
    const { AllPlanData } = this.state
    const data = JSON.parse(JSON.stringify(AllPlanData))
    data.forEach(item => { item.isEdit = false })
    this.setState({
      AllPlanData: data
    })
  }

  //关闭新增方案
  cancelAddPlan = () => {
    this.setState({
      addPlanVisible: false
    })
  }

  //取消编辑方案
  cancelEditPlan = (item) => {
    const { pageSize } = this.state
    this.closeEditPlan()
    this.getPatchList(1, pageSize, item.stringId)
  }

  //查看是否被删除
  checkAlive = (id, url) => {
    api.checkPatch({
      param: id
    }).then(response => {
      if (!response.body) {
        window.open(`/#${url}`)
      } else {
        Message.error('该补丁已被删除！')
      }
    })
  }
}

export default withRouter(PlanDetail)
