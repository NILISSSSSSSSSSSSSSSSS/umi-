import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import './style.less'
import Header from './HeaderView'
import Footer from './Footer'
import cls from 'classnames'
import config from '@/config/config.js'
// import moment from 'moment'
import Breadcrumbs from '../components/Breadcrumbs'
import { Layout } from 'antd'
import Menu from './Menu'
import menus from '@a/menuTree'

const { Sider, Content } = Layout

// @connect(({ common, loading }) => ({ common, loading }))

class BasicLayout extends Component {
  state = {
    PrefixCls: 'BasicLayout',
    islogin: true
  }

  render () {
    const { children } = this.props
    const { PrefixCls, islogin } = this.state
    return (
      <Fragment>
        <Layout className={cls(PrefixCls)}>
          <Header islogin={islogin} onSignOut={this.onSignOut}/>
          <Layout>
            <Sider
              trigger={null}
              collapsible
            >
              <Menu menus={menus}/>
            </Sider>
            <Content style={{ padding: '0 20px', bpxSizing: 'border-box' }} id="main">
              <Breadcrumbs />
              {children}
            </Content>

            {/* <Footer footer={config.copyright}></Footer> */}
          </Layout>
        </Layout>
      </Fragment>
    )
  }
}

BasicLayout.propTypes = {
}

export default connect()(BasicLayout)
