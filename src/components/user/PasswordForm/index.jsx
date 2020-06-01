import { Component } from 'react'
import { Form, Button, Modal, Input, Icon } from 'antd'
import  * as regular  from '@u/validate'
const { Item } = Form

class passwordAlert extends Component {
  constructor (props) {
    super(props)
    this.state = {
      state: true
    }
  }
  submits = (e)=>{
    e.preventDefault()
    const { onSubmit } = this.props
    let res = onSubmit(this.props.form)
    if(res) this.setState({ state: true })
  }
  onCancel=()=>{
    const { onClose } = this.props
    this.setState({ state: true })
    this.props.form.resetFields()
    onClose()
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { title, visible } = this.props
    let { state } = this.state
    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 20
      }
    }
    return (
      <div>
        <Modal
          title={title}
          visible={visible}
          onCancel={this.onCancel}
          footer={null}>
          <Form onSubmit={this.submits} >
            <Input   name="newPassword" style={{ display: 'none' }}></Input>
            <Item {...formItemLayout} label="新密码">
              {getFieldDecorator('newPassword', {
                rules: [{ required: true, message: '密码不能为空' }, {
                  pattern: regular.pwdPattern, message: '密码必须为8至16位，包含数字、大小字母及特殊符号'
                }]
              })(
                <Input type={ state ? 'password' : 'text' } placeholder="请输入新密码" autoComplete ="new-password"
                  suffix={
                    <Icon type={ state ? 'eye-invisible' : 'eye'} onClick={()=> this.setState({ state: !state })}/>
                  } />
              )}
            </Item>
            <Item style={{ textAlign: 'center' }}>
              <Button style={{ marginRight: '20px' }} type="primary" htmlType="submit">确定</Button>
              <Button type='primary' ghost onClick={this.onCancel}>取消</Button>
            </Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

const passwordAlerts = Form.create()(passwordAlert)
export default passwordAlerts
