import { Component } from 'react'
import { connect } from 'dva'
import { Form, Input, Button, Layout } from 'antd'
import api from '@/services/api'
import { encrypt } from '@u/common'
import './style.less'

const { Item } = Form
const { Header, Content, Footer } = Layout

const warnInfo = {
  noName: '请输入用户名称',
  noPassword: '请输入登录密码',
  noImageCode: '请输入验证码'
}

class Login extends Component {
  constructor(props) {
    super(props)
    this.state = {
      msg: '',
      imageCodeUrl: `api/v1/user/code?time=${Date.parse(new Date())}`
    }
  }
  getImageCodeUrl = () => {
    this.setState({
      imageCodeUrl: `api/v1/user/code?time=${Date.parse(new Date())}`
    })
  }
  render () {
    const { getFieldDecorator } = this.props.form
    const { msg, imageCodeUrl } = this.state
    const formItemLayout = {
      labelCol: {
        span: 4
      },
      wrapperCol: {
        span: 19
      },
      colon: false
    }
    const codeFormItemLayout = {
      wrapperCol: {
        span: 24,
        offset: 0
      }
    }
    return (
      <div className="login-content">
        <Header className="header">
          <span className="header-icon">
            <img src={require('@a/images/header-logo.png')} alt="安天" />
          </span>
        </Header>
        <Content className="loginCss">
          <div className="img-container">
            <div className="img-wrap">
              <img src={require('@a/images/carousel-01.png')} alt="" />
            </div>
            <h1>安天知识库管理平台</h1>
          </div>
          {/* 登录框 */}
          <div className="content-login">
            <div className="login-icon">
              <img src={require('@a/images/login-logo.png')} alt="安天" />
            </div>
            <h1>安天知识库管理平台</h1>
            <div className="form-wrap password-res-shows">
              {msg &&
                <div className="tips">
                  <img src={require('@a/images/warn.png')} alt="warn" />
                  <span>{msg}</span>
                </div>
              }
              <Form onSubmit={this.handleSubmit} autoComplete="off">
                <Input name="hideText" style={{ display: 'none' }}></Input>
                <Item {...formItemLayout} label='账号' className="input-item">
                  {getFieldDecorator('username')(
                    <Input type='text' autoComplete="off" placeholder='请输入用户名称' />
                  )}
                </Item>
                <Item {...formItemLayout} label='密码' className="input-item">
                  {getFieldDecorator('password')(
                    <div>
                      <Input type='password' style={{ display: 'none' }} />
                      <Input type="password" placeholder='请输入登录密码' autoComplete="new-password" />
                    </div>
                  )}
                </Item>
                <Item {...codeFormItemLayout} label='' className="input-code-item">
                  {getFieldDecorator('code')(
                    <Input autoComplete="off" placeholder='请输入验证码' maxLength={6} />
                  )}
                  <span className="code-img">
                    <img src={imageCodeUrl} alt="图形验证码" onClick={this.getImageCodeUrl} />
                  </span>
                </Item>
                <Button type='primary' htmlType='submit' className="login-btn">登录</Button>
              </Form>
            </div>
          </div>
        </Content>
        <Footer className="footer">
          <p>{`© ${new Date().getFullYear()} 版权所有 Antiy | 哈尔滨安天科技集团股份有限公司`}</p>
        </Footer>
      </div>
    )
  }

  // 执行登录
  handleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const { username, password, code } = values
        if (!username) {
          this.setState({
            msg: warnInfo.noName
          })
          return false
        }
        if (!password) {
          this.setState({
            msg: warnInfo.noPassword
          })
          return false
        }
        if (!code) {
          this.setState({
            msg: warnInfo.noImageCode
          })
          return false
        }
        values.password = encrypt(values.password)
        this.setState({
          msg: ''
        }, () => {
          api.login(values).then(res => {
            const data = res.body
            // 记录当前用户数据，个人中心使用
            sessionStorage.setItem('userInfo', JSON.stringify(data.userInfo))
            sessionStorage.setItem('token', data.token)
            sessionStorage.menus = JSON.stringify(data.userInfo.menus || [])
            this.props.history.push('/indexPage')
          }).catch(err => {
            this.getImageCodeUrl()
          })
        })
      }
    })
  }
}

const LoginForm = Form.create()(Login)
export default connect()(LoginForm)
