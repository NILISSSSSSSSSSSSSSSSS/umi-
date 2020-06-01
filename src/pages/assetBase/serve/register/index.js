import React, { Component } from 'react'
import { ServeRegister } from '@c/assetBase/serve/index'
import { registerServe } from '@services/assetServices'
export default class Register extends Component {
  /**
   * 提交登记服务请求
   * @param values
   * @param callback 点击查询时的，完成之后回调，显示关联的操作内容
   */
  onSubmit = (values) => {
    registerServe(values).then((res)=>{
      const { history: { push } } = this.props
      push(`/assetBase/serve/edit?serveId=${res.body}`)
      // callback()
    })
  }
  render () {
    return (
      <ServeRegister onSubmit={this.onSubmit}/>
    )
  }
}
