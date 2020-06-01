import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { message } from 'antd'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { Ware } from '@c/index'  //引入方式

const perMission = {
  soHaImport: 'asset:software:import', //导入
  entrybase: 'asset:software:entrybase', //入库
  soHadelete: 'asset:software:delete', //删除
  edit: 'asset:software:edit', //编辑
  view: 'asset:software:view' //查看
}
class Software extends PureComponent {

  static={}

  static propTypes={
    soHardwareStorage: PropTypes.object,
    soHardwareDel: PropTypes.number
  }

  //入库或删除回调
  inDelCB=(data, msg)=>{
    const dataMsg = this.props[data]
    if(dataMsg){
      message.success(msg ? `${msg}成功` : dataMsg.msg)
      // this.soHardwareList()
    }
  }

  /***************副作用开始************** */
  //列表数据
  soHardwareList=debounce(async (values = {})=>{
    const payload = {
      assetType: 'SOFT',
      supplier: values.supplier || null,
      productName: values.productName || null,
      version: values.version || null,
      beginTime: values.beginTime || null,
      endTime: values.endTime || null,
      sortName: values.sortName || null,
      sortOrder: values.sortOrder || null,
      isStorage: values.isStorage || null,
      type: values.softType || null,
      sysVersion: values.sysVersion || null,
      // softVersion: values.softVersion || null,
      // softPlatform: values.softPlatform || null,
      // hardPlatform: values.hardPlatform || null,
      language: values.language || null,
      pageSize: values.pageSize || 10,
      currentPage: values.currentPage || 1
    }
    await this.props.dispatch({ type: 'soHardware/soHardwareList', payload })
  }, 300)

  //提交入库
  storageEffect=async businessIds=>{
    await this.props.dispatch({ type: 'soHardware/soHardwareStorage', payload: { businessIds } })
    this.inDelCB('soHardwareStorage')
  }

  //提交删除
  deleteEffect=async businessIds=>{
    await this.props.dispatch({ type: 'soHardware/soHardwareDel', payload: { businessIds } })
    this.inDelCB('soHardwareDel', '删除')
  }

  render (){
    const { softSearchHead, softwareColumns, softSenior } = this.props
    return(
      <Ware
      //提交接口,重置接口,翻页
        dataFunc={this.soHardwareList}
        //提交入库
        storageEffect={this.storageEffect}
        //入库文字
        storageMsg='软件'
        //提交删除
        deleteEffect={this.deleteEffect}
        //删除文字
        deleteMsg='软件'
        //搜索
        soHardSearchHead={softSearchHead}
        sohardSenior={softSenior}
        soHardwareColumns={softwareColumns}
        //跳转地址
        url='software'
        type='2' //后台要求软件2
        perMission={perMission} //权限
      />
    )
  }

}

export default connect(({ soHardware, staticSoHardware }) => ({
  softSearchHead: staticSoHardware.softSearchHead,
  softwareColumns: staticSoHardware.softwareColumns,
  soHardwareStorage: soHardware.soHardwareStorage,
  soHardwareDel: soHardware.soHardwareDel,
  softSenior: staticSoHardware.softSenior
}))(Software)
