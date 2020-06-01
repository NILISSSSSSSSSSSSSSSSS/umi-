import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { CommonModal } from '@c/index'
import config from '@/config/config.js'
import api from '@/services/api'
import { Layout, Avatar, Menu, Dropdown } from 'antd'
import PropTypes from 'prop-types'
import ChangePwd from '@c/ChangePwd'

const { Header } = Layout

class HeaderView extends PureComponent {
  state = {
    changePwdVisible: false, // 修改密码Modal
    confirmModalVisible: false  // 确认退出Modal
  }
  handleClickMenu = e => {
    e.key === 'SignOut' && this.props.onSignOut()
  }
  // 退出登录
  logout = () => {
    const { dispatch } = this.props
    api.logout().then(res => {
      sessionStorage.clear()
      dispatch({ type: 'common/logout' })
    })
  }
  changelangs=e=>{
    const { dispatch } = this.props
    dispatch({ type: 'common/chlang', payload: e.key })
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
  render () {
    const { collapsed, islogin } = this.props
    const { changePwdVisible, confirmModalVisible } = this.state
    const userInfo = sessionStorage.getItem('userInfo')

    const menu = (
      <Menu>
        <Menu.Item key="pwd" onClick={() => {this.setModalVisible('changePwdVisible', true)}}>
            修改密码
        </Menu.Item>
        <Menu.Item key="SignOut" onClick={() => {this.setModalVisible('confirmModalVisible', true)}}>
            退出登录
        </Menu.Item>
      </Menu>
    )

    const lang = (
      <Menu onClick={this.changelangs}>
        <Menu.Item key="zh_CN">
            中文
        </Menu.Item>
        <Menu.Item key="en_US">
            English
        </Menu.Item>
      </Menu>
    )

    return (
      <Header style={{ background: '#fff', padding: '0 10px' }}>
        <div className='header-left'>
          <img alt="logo" src={config.logoPath}/>
          {/*<h1>{config.siteName}</h1>*/}
        </div>

        <div className="header-right">
          {/* <Badge count={100}>
            <Icon type="bell" />
          </Badge> */}

          <Avatar
            size="small"
            src={require('@a/images/user.png')}
          />

          {islogin && (
            <Dropdown overlay={menu} placement="bottomRight">
              <span className="user-name">{userInfo ? JSON.parse(userInfo).name : '--'}</span>
            </Dropdown>
          )}

          {/* <Dropdown overlay={lang} placement="bottomRight">
            <Icon type="global" />
          </Dropdown> */}
        </div>
        <ChangePwd
          visible={changePwdVisible}
          onClose={() => {this.setModalVisible('changePwdVisible', false)}}
        ></ChangePwd>
        <CommonModal
          type="confirm"
          visible={confirmModalVisible}
          onConfirm={this.logout}
          onClose={() => {this.setModalVisible('confirmModalVisible', false)}}
        >
          <p className="confirm-text">确认退出系统？</p>
        </CommonModal>
      </Header>
    )
  }
}

HeaderView.propTypes = {
  collapsed: PropTypes.bool,
  islogin: PropTypes.bool,
  onSignOut: PropTypes.func
}

export default connect(({ common })=>({ language: common.language }))(HeaderView)
