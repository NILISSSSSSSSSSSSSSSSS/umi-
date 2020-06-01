import React, { Component } from 'react'
import { ServeRegister } from '@c/assetBase/serve/index'
import { editService } from '@services/assetServices'
import { message } from 'antd'

export default class Edit extends Component {
  /**
   * 提交变更服务请求
   * @param values
   * @param callback
   */
  onSubmit = (values, callback) => {
    editService(values).then((res)=>{
      callback()
      message.success('保存成功!')
    })
  }
  render () {
    return (
      <ServeRegister onSubmit={this.onSubmit} isEdit/>
    )
  }
}
