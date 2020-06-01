import React, { Component } from 'react'
import { PartDetail } from '@c/assetBase/parts/index'

export default class PartsDetail extends Component {
  /**
   * 提交请求
   * @param values
   */
  onSubmit = (values) => {

  }
  render () {
    return (
      <PartDetail onSubmit={this.onSubmit}/>
    )
  }
}
