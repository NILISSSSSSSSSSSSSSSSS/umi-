export default {
  namespace: 'auth',
  state: {

  },
  //全局路由拦截
  subscriptions: {
    set ({ dispatch, history }) {
      history.listen(({ pathname }) => {
        const menus = JSON.parse(sessionStorage.getItem('menus') || '[]')
        // 无须任何权限，可以直接进入到改页面
        const excludepaths = []
        if (!menus.includes(pathname) && !excludepaths.includes(pathname)) {
        //   history.push('/401')
        }
      })
    }
  }
}
