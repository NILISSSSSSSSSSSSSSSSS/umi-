import { Component } from 'react'
import { Form, Button, Input, Tree, Message, Icon } from 'antd'
import './style.less'
import * as regular from '@u/validate'
import api from '@services/user'
import { analysisUrl, encrypt } from '@u/common'
import { withRouter } from 'umi'

const { Item } = Form
const { TreeNode } = Tree
@Form.create()
class UserRegister extends Component {
  constructor (props) {
    super(props)
    this.state = {
      treeData: [],
      //默认选中的节点
      menuBhs: [],
      nowNode: [],
      parents: [],
      saveParentKey: [],
      compare: [],
      keyArray: [],
      tagArray: [],
      Obs: analysisUrl(props.location.search) || {},
      state: true
    }
  }
  async componentDidMount () {
    let { Obs } = this.state
    await this.getMenuTree()
    if(Obs.id) this.initIdata(Obs.id)
  }
    //树形菜单展开事件
    expands=(k, opntion)=>{
      let { nowNode } = this.state
      let v = opntion.node.props.eventKey
      //判断key是否存在
      if(!nowNode.includes(v)) nowNode.push(v)
      else nowNode = nowNode.filter(now=>now !== v )
      this.setState({ nowNode })
    }
    //有id时 加载数据
    initIdata = (idr)=>{
      api.getUserBase({ bh: idr }).then(data=>{
        this.setState({ userId: data.body.bh, menuBhs: data.body.menuBhs }, ()=>{
          let init = [] //筛选父级 菜单以外的子级选项
          const { name, username, email } = data.body
          const { saveParentKey, menuBhs, Obs, keyArray, tagArray } = this.state
          if(Obs.type !== 'register'){
            //过滤父级菜单ID
            menuBhs.forEach(item=>{
              saveParentKey.push(item)
              if(!keyArray.includes(item)){
                init.push(item)
              }
            })
          }
          tagArray.forEach(item=>{
            if(['shouye'].includes(item.tag)) init.push(item.id)
          })
          this.setState({ menuBhs: init, compare: saveParentKey, saveParentKey }, ()=>{
            this.props.form.setFieldsValue({
              name, username, email, menuBhs: this.state.menuBhs
            })
          })
        })
      })
    }
    //遍历KEY
    getIdsMap=(item)=>{
      let { keyArray, tagArray  } = this.state
      item.forEach(el => {
        if(el.childs && el.childs.length){
          keyArray.push(el.bh)
          tagArray.push({ tag: el.tag, id: el.bh, childs: el.childs })
          this.getIdsMap(el.childs)
        }else{
          tagArray.push({ tag: el.tag, id: el.bh, childs: el.childs })
        }
      })
      this.setState({ keyArray, tagArray })
    }
    //获取菜单权限树
    getMenuTree = async () => {
      await api.getMenuTree({}).then(response => {
        let { tagArray  } = this.state
        let init = []
        this.getIdsMap(response.body.childs)
        tagArray.forEach(item=>{
          if(['shouye'].includes(item.tag)) init.push(item.id)
        })
        this.setState({
          treeData: [response.body],
          nowNode: [response.body.bh],
          initKey: response.body.bh,
          menuBhs: init
        }, ()=>{
          let { menuBhs } = this.state
          this.props.form.setFieldsValue({
            menuBhs
          })
        })
      })
    }
    //取消
    handleReset = (res = true)=>{
      let { initKey, tagArray, menuBhs } = this.state
      this.props.form.resetFields()
      if(res) {
        this.props.history.goBack()
      }else{
        menuBhs = [tagArray.filter(item=>item.tag === 'shouye')[0].id]
        this.setState({
          menuBhs,
          nowNode: [initKey],
          compare: [],
          keyArray: [],
          state: true
        }, ()=>{
          let { menuBhs } = this.state
          this.props.form.setFieldsValue({ menuBhs })
        })
      }
    }
    handleReset = (res = true)=>{
      let { initKey, tagArray, menuBhs } = this.state
      this.props.form.resetFields()
      if(res) {
        this.props.history.goBack()
      }else{
        menuBhs = [tagArray.filter(item=>item.tag === 'shouye')[0].id]
        this.setState({
          menuBhs,
          nowNode: [initKey],
          compare: [],
          keyArray: [],
          state: true
        }, ()=>{
          let { menuBhs } = this.state
          this.props.form.setFieldsValue({ menuBhs })
        })
      }
    }

    //提交表单
    handleSubmit = (e, res = true) => {
      e.preventDefault()
      this.props.form.validateFields((err, values) => {
        if (!err) {
          let text, url
          const { type, id } = this.state.Obs
          const { parents, saveParentKey, compare } = this.state
          if(parents.length)
            values.menuBhs = values.menuBhs.concat(parents)
          if(JSON.stringify(compare) === JSON.stringify(saveParentKey) && saveParentKey.length)
            values.menuBhs = saveParentKey
          if(values.password) values.password = encrypt(values.password)
          values.menuBhs = Array.from( new Set(values.menuBhs))
          if (type === 'register') {
            text = '登记'
            url = 'postAddUser'
          } else if (type === 'change') {
            text = '变更'
            url = 'postChangeUser'
            values.bh = id
          }
          api[url](values).then(data => {
            Message.success(`${text}成功`)
            this.handleReset(res)
          })
        }
      })
    }
    //勾选可访问的菜单
    onCheck = (menuBhs, obs) => {
      let { initKey, tagArray } = this.state
      tagArray.forEach(item=>{
        if(['shouye'].includes(item.tag)) menuBhs.push(item.id)
      })
      this.setState({
        menuBhs: menuBhs,
        compare: [],
        parents: obs.halfCheckedKeys.filter((item)=>item !== initKey) })
      this.props.form.setFieldsValue({ menuBhs: menuBhs })
    }
    //渲染树
    renderTreeNodes = data => data.map(item => {
      if (!item) return []
      if (item.childs)
        return (
          <TreeNode title={item.name} key={item.bh} >
            {this.renderTreeNodes(item.childs)}
          </TreeNode>
        )
      else
        return <TreeNode title={item.name} key={item.bh}/>
    })
    render () {
      const { getFieldDecorator } = this.props.form
      const { treeData, nowNode, menuBhs, Obs, state } = this.state
      //详情禁止编辑
      const disabled = Obs.type === 'detail' ? true : false
      const nextSave = Obs.type === 'register'
      return (
        <div className="main-table-content register-content" onSubmit={this.handleSubmit}>
          <Form>
            <div className="New-flex-layout">
              <Item label='用户名'>
                {getFieldDecorator('username', {
                  rules: [
                    { min: 1, max: 30, message: '字符输入长度 1 - 30' },
                    { required: true,  message: '用户名不能为空' },
                    { whitespace: true, message: '用户名不能为空' },
                    {
                      pattern: regular.verifyUserName, message: '不能有特殊符号或空格'
                    }
                  ]
                })(
                  <Input allowClear={nextSave} autoComplete="off" disabled={!nextSave} placeholder='请输入用户名' />
                )}
              </Item>
              <Item label='姓名' className="item-separation">
                {getFieldDecorator('name', { rules: [
                  { min: 1, max: 30, message: '字符输入长度 1 - 30' },
                  { required: true,  message: '姓名不能为空' },
                  { whitespace: true, message: '姓名不能为空' },
                  {
                    pattern: regular.verifyUserName, message: '不能有特殊符号或空格'
                  }
                ]
                })(
                  <Input allowClear={!disabled} autoComplete="off" disabled={disabled} placeholder='请输入姓名' />
                )}
              </Item>
              {
                !nextSave  ? null : (
                  <Item label='用户密码'>
                    <div>
                      <input  type='password' style={{ display: 'none' }}/>
                      {getFieldDecorator('password', {
                        rules: [
                          { required: true,  message: '密码不能为空' },
                          { pattern: regular.pwdPattern, message: '密码必须为8至16位，包含数字、大小字母及特殊符号' }
                        ]
                      } )(
                        <Input allowClear type={ state ? 'password' : 'text' } disabled={disabled} placeholder="请输入用户密码" autoComplete ="new-password"
                          suffix={
                            <Icon type={ state ? 'eye-invisible' : 'eye'} onClick={()=> this.setState({ state: !state })}/>
                          } />
                      )}
                    </div>
                  </Item>
                )
              }
              <Item label='电子邮箱'>
                {getFieldDecorator('email', {
                  rules: [
                    { min: 1, max: 30, message: '字符输入长度 1 - 30' },
                    { pattern: /^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)(com|cn)$/, message: '电子邮箱格式不正确' }
                  ]
                })(
                  <Input allowClear={!disabled} autoComplete="off" disabled={disabled} placeholder={ disabled ? '' : '请输入电子邮箱' } />
                )}
              </Item>
            </div>
            <div className='trees-content'>
              <Item label='访问权限'>
                {getFieldDecorator('menuBhs', {
                  rules: [{ required: true,  message: '权限不能为空' }]
                })(
                  <Tree
                    showLine={true}
                    disabled={disabled}
                    checkable
                    expandedKeys={nowNode}
                    checkStrictly={false}
                    onCheck={this.onCheck}
                    checkedKeys={menuBhs}
                    onExpand={this.expands}
                  >
                    {this.renderTreeNodes(treeData)}
                  </Tree>
                )}
              </Item>
              <div className='button-center form-button-center'>
                <div>
                  {
                    disabled ? null : <Button type='primary' htmlType='submit'>保存</Button>
                  }
                  {
                    nextSave ? <Button type='primary' style={{ width: 100 }}
                      onClick={(e)=>this.handleSubmit(e, false)}>保存并新建</Button> : null
                  }
                  <Button className="back-btn" type='primary' ghost onClick={this.handleReset} >
                    { disabled ? '返回' : '取消' }</Button>
                </div>
              </div>
            </div>
          </Form>
        </div>
      )
    }
}
export default withRouter(UserRegister)
