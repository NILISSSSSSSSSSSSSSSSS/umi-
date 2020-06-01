import { Component } from 'react'
import { Menu } from 'antd'
import './style.less'
import { router } from 'dva'
import { hasAuth, cache } from '@u/common'
const { NavLink, withRouter } = router
const { SubMenu, Item } = Menu

class MenuTree extends Component {
  constructor (props) {
    super(props)
    this.state = {
      openKeys: []
    }
  }

  componentDidMount () {
  }

  /**
   * 菜单点击事件
   * 把打开的折叠菜单记录下来，以便刷新界面时，快速展开之前的菜单
   * */
  onOpenChange = (keyPath) => {
    const newKeyPath = keyPath
    this.setState({ openKeys: newKeyPath })
    sessionStorage.setItem('openKeys', newKeyPath.join(','))
  }

  /**
   * 生成菜单的选中项，在刷新页面时，提供刷新之前选中的菜单项
   **/
  generateMenuSelectKeys () {
    const { pathname = '' } = this.props.history.location
    const urlArr = pathname.split('/').splice(1)
    return [ urlArr.map((path) => `/${ path }`).join('') ]
  }

  /**
   * 生成菜单的展开项，在刷新页面时，提供刷新之前展开的菜单项
   **/
  generateMenuOpenKeys () {
    const { openKeys: _openKeys } = this.state
    const openKeys = this.findMenuOpenKey(_openKeys)
    return openKeys
  }
  findMenuOpenKey = (list = []) => {
    const openKeys = (sessionStorage.getItem('openKeys') || '').split(',').filter(e=>e)
    if(list.length){
      const _openKey = []
      let curOpenKey = ''
      for(let  i = 0, len = list.length; i < len - 1; ++i ){
        if(!openKeys.includes(list[i])){
          curOpenKey += ('/' + list[i])
          _openKey.push(curOpenKey)
        }
      }
      return [ ...new Set([ ...openKeys, ..._openKey ]) ]
    }else {
      return openKeys
    }
  }
  render () {
    const { menus } = this.props
    return (
      <Menu mode="inline" className='menu' onOpenChange={ this.onOpenChange } selectedKeys={this.generateMenuSelectKeys()} openKeys={this.generateMenuOpenKeys()}>
        {
          this.getMenu(menus)
        }
      </Menu>
    )
  }

  //获取菜单权限
  getMenu = menuTree => menuTree.map(item => {
    // console.log(item)
    // 判断是否显示改菜单项
    const isDetail = typeof item.show === 'boolean' ? !item.show : false
    if(isDetail || !hasAuth(item.tag)) {
      return null
    }
    // <img src={item.icon} className="menu-icon" alt=""/>
    // console.log(item)
    // 显示的子菜单的数量
    const showMenuItemLength = (item.children || []).filter((e) => typeof e.show === 'undefined' ? true : e.show).length
    // 有子菜单项，并且子菜单必须有一个时显示
    if(item.children && showMenuItemLength) {
      return (
        <SubMenu key={ item.path } title={
          <span>
            { item.icon ? (<svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 1070 1024" version="1.1" p-id="3883" width="22" height="22">
              <defs>
                <style type="text/css"/>
              </defs>
              <path d={ item.icon } p-id="3884"></path>
            </svg>) : null }
            <span>{ item.name }</span>
          </span>
        }>
          { this.getMenu(item.children) }
        </SubMenu>
      )
    }
    return <Item key={ item.path }><NavLink onClick={() => cache.clear()} to={ item.path }>{ item.icon ? (
      <svg xmlns="http://www.w3.org/2000/svg" xlink="http://www.w3.org/1999/xlink"
        viewBox="0 0 1070 1024" version="1.1" p-id="3883" width="22" height="22">
        <defs>
          <style type="text/css"/>
        </defs>
        <path d={ item.icon } p-id="3884"></path>
      </svg>) : null }{ item.name }</NavLink></Item>
  })
}
export default withRouter(MenuTree)
