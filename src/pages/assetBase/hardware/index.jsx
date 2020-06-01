import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { message } from 'antd'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { Ware } from '@c/index'  //引入方式

const perMission = {
  soHaImport: 'asset:hard:import', //导入
  entrybase: 'asset:hard:entrybase', //入库
  soHadelete: 'asset:hard:delete', //删除
  edit: 'asset:hard:edit', //编辑
  view: 'asset:hard:view' //查看
}
class Hardware extends PureComponent {
  static={}

  static propTypes={
    soHardwareStorage: PropTypes.object,
    soHardwareDel: PropTypes.number
  }

  //入库或删除回调
  inDelCB=(data, msg = null)=>{
    const dataMsg = this.props[data]
    if(dataMsg){
      message.success(msg ? `${msg}成功` : dataMsg.msg)
    }
  }

  /***************副作用开始************** */
  //列表数据
  soHardwareList=debounce(async (values = {})=>{
    const payload = {
      assetType: 'HARD',
      supplier: values.supplier || null,
      productName: values.productName || null,
      version: values.version || null,
      beginTime: values.beginTime || null,
      endTime: values.endTime || null,
      sortName: values.sortName || null,
      sortOrder: values.sortOrder || null,
      isStorage: values.isStorage || null,
      sysVersion: values.sysVersion || null,
      softVersion: values.softVersion || null,
      softPlatform: values.softPlatform || null,
      hardPlatform: values.hardPlatform || null,
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
    const { hardSearchHead, hardwareColumns, hardSenior } = this.props
    return(
      <Ware
        //提交接口,重置接口,翻页
        dataFunc={this.soHardwareList}
        //列表数据

        //提交入库
        storageEffect={this.storageEffect}
        //入库文字
        storageMsg='硬件'
        //提交删除
        deleteEffect={this.deleteEffect}
        //删除文字
        deleteMsg='硬件'
        //搜索
        soHardSearchHead={hardSearchHead}
        sohardSenior={hardSenior}
        soHardwareColumns={hardwareColumns}
        //跳转地址
        url='hardware'
        type='1' //后台要求硬件1
        perMission={perMission} //权限
      />
    )
  }

}

export default connect(({ soHardware, staticSoHardware }) => ({
  soHardwareStorage: soHardware.soHardwareStorage,
  hardwareColumns: staticSoHardware.hardwareColumns,
  soHardwareDel: soHardware.soHardwareDel,
  hardSearchHead: staticSoHardware.hardSearchHead,
  hardSenior: staticSoHardware.hardSenior
}))(Hardware)
