
import request from '@u/request'

export default {
  //管理员重置密码
  resetPassword: (param)=> request('post', '/user/adminResetPwd', param)
  ,
  //获取用户详细信息
  getUserBase: (param)=> request('post', '/user/detail', param)
  ,
  //获取用户列表
  getUserList: (param)=> request('post', '/user/list', param)
  ,
  //获取菜单树
  getMenuTree: (param)=> request('post', '/user/menuTree', param)
  ,
  //新增用户
  postAddUser: (param)=> request('post', '/user/save', param)
  ,
  //修改用户信息
  postChangeUser: (param)=> request('post', '/user/update', param)
  ,
  //更改用户状态
  changeUserStatus: (param)=> request('post', '/user/updateStatus', param)
  ,
  //用户修改密码
  userChangePassword: (param)=> request('post', '/user/userResetPwd', param)
}