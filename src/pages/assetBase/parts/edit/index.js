import { Component } from 'react'
import { message } from 'antd'
import { PartRegister } from '@c/assetBase/parts/index'
import { editPart } from '@services/parts'
export default class PartsEdit extends Component {
  /**
   * 提交请求
   * @param values
   * @param callback
   */
  onSubmit = (values, callback) => {
    editPart(values).then(()=>{
      message.success('保存成功')
      callback && callback()
    })
  }
  render () {
    return (
      <PartRegister onSubmit={this.onSubmit} isEdit/>
    )
  }
}
