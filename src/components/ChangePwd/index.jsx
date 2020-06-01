import { Component } from 'react'
import { Form, message } from 'antd'
import { CommonModal } from '@c/index'
import { generateRules, encrypt } from '@u/common'
import { pwdPattern } from '@u/validate'
import api from '@/services/api'

const { Item } = Form
const formLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 12
  }
}
class UpgradeSet extends Component {
  constructor (props) {
    super(props)
    this.state = {
      modalFormValue: {}
    }
  }
  componentDidMount () {
  }
  modalHandleSubmit = values => {
    this.setState({
      modalFormValue: values
    }, () => {
      if(values.oldPassword === values.newPassword){
        message.error('新密码与原密码不能一致')
        return
      }else if(values.repeatPassword !== values.newPassword){
        message.error('确认新密码不正确，请检查确认密码')
        return
      }
      values.bh = JSON.parse(sessionStorage.getItem('userInfo')).bh
      values.oldPassword = encrypt(values.oldPassword)
      values.newPassword = encrypt(values.newPassword)
      delete values.repeatPassword
      api.userChangePassword(values).then(res => {
        message.success('修改密码成功！')
        this.props.onClose()
        // this.props.history.push('/indexPage')
      })
    })
  }
  render () {
    const { visible, onClose } = this.props
    const modalFormFields = [
      { type: 'input', key: 'oldPassword', name: '原密码', inputType: 'password', placeholder: '请输入', rules: [{ required: true,  message: '请输入原密码' },  ...generateRules()] },
      { type: 'input', key: 'newPassword', name: '新密码', inputType: 'password', laceholder: '请输入', rules: [{ required: true,  message: '请输入新密码' }, { pattern: pwdPattern, message: '密码必须为8至16位，包含数字、大小字母及特殊符号' }, ...generateRules()] },
      { type: 'input', key: 'repeatPassword', name: '确认新密码', inputType: 'password', laceholder: '请输入', rules: [{ required: true,  message: '请确认新密码' },  ...generateRules()] }
    ]
    return (
      <CommonModal
        type="form"
        visible={visible}
        title="修改密码"
        width={650}
        oktext="保存"
        value={this.modalHandleSubmit}
        onClose={onClose}
        fields={modalFormFields}
        column={1}
        FormItem={Item}
        formLayout={formLayout}
      >
      </CommonModal>
    )
  }
}
export default UpgradeSet
