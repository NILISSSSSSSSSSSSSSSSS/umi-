import { Component } from 'react'
import BugDetailInfo from '@c/BugPatch/BugDetail'
import BugTabsDetailAndChange from '@c/BugPatch/BugTabsDetailAndChange'
import api from '@/services/api'
import { analysisUrl } from '@u/common'

class BugDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      detailData: {}
    }
  }

  componentDidMount () {
    this.getDetail()
  }

  render () {
    const { detailData } = this.state
    return (
      <div className="main-detail-content">
        {/* 详情信息 */}
        <BugDetailInfo body={detailData} />
        <BugTabsDetailAndChange props={{ page: 'formal', type: 'detail', from: 'bug', id: analysisUrl(this.props.location.search).id }}/>
      </div>
    )
  }

  //获取漏洞详情
  getDetail = () => {
    api.getBugDetail({
      antiyVulnId: this.state.id
    }).then(response => {
      const body = response.body
      const { metrics } = body
      //CVSS
      if (metrics && metrics !== '' && metrics.includes('-')) {
        const [v, n] = metrics.split('-')
        if (!n.includes('.')) {
          body.metrics = `${v}-${n}.0`
        }
      }
      this.setState({
        detailData: body
      })
    })
  }
}

export default BugDetail
