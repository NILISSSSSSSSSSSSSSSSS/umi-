import React, { PureComponent } from 'react'
import {
  Table
} from 'antd'
import { TooltipFn, transliteration } from '@u/common'
import { Link } from 'react-router-dom'

class Tab extends PureComponent {

  state = {
    currentPage: 1,
    pageSize: 10
  };
  render (){
    const { currentPage, pageSize } = this.state

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: text=>TooltipFn(text)
    }, {
      title: '编号',
      dataIndex: 'number',
      key: 'number',
      render: text=>TooltipFn(text)
    }, {
      title: '操作',
      dataIndex: 'ccctest',
      key: 'ccctest',
      render: (record, item)=> (
        <div className="operate-wrap">
          <Link to={`/asset/manage/detail/hardware?id=${transliteration(item.stringId)}`}>
          查看
          </Link>
          <a href="#">操作</a>
        </div>
      )
    }]

    let hardwareBody = [
      {
        name: 666,
        number: 999
      },
      {
        number: 777
      }
    ]

    for(let i = 0; i < 100;i++){
      const arr = {
        name: 666,
        number: 111
      }
      hardwareBody.push(arr)
    }
    const totalRecords = 102

    const noarr = []

    return(
      <div style={{ background: 'white', height: 800 }}>
        {/* 使用class */}
        <Table
          rowKey={(text, recored)=>recored}
          columns={columns}
          dataSource={hardwareBody}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '30', '40'],
            showTotal: () => `共 ${totalRecords} 条数据`,
            total: totalRecords
          }}
        />
      </div>
    )
  }

}

export default Tab
