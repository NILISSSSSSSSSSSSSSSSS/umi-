import React, { Component, Fragment } from 'react'
import { connect } from 'dva'
import withRouter from 'umi/withRouter'
import BaseLayout from './BaseLayout'
import { LocaleProvider } from 'antd'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import Context from './MenuContext'
// import { ContainerQuery } from 'react-container-query';  //为响应式准备

@withRouter
class Layout extends Component {
  state = {
    pathname: ''
  }

  render () {
    const { children, location } = this.props
    if (location.pathname === '/404' || location.pathname === '/login') {
      return <Fragment>{children}</Fragment>
    }
    if(!sessionStorage.menus) this.props.history.push('/login')
    if(location.pathname === '/' && sessionStorage.menus) this.props.history.push('/indexPage')
    return (
      <LocaleProvider locale={zhCN}>
        <Context.Provider>
          <BaseLayout >{children}</BaseLayout>
        </Context.Provider>
      </LocaleProvider>
    )
  }

  componentDidMount () {
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const pathname = nextProps.history.location.pathname
    if (pathname !== this.state.pathname) {
      // console.log(this)
      // console.log('结果', this.state.pathname)
      this.setState({ pathname })
      window.scrollTo(0, 0)
      // setTimeout(()=>{

      // })
    }
  }
}

export default connect()(Layout)
