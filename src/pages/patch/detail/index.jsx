import { Component } from 'react'
import { connect } from 'dva'
import PatchDetailInfo from '@c/BugPatch/PatchDetail'
import PatchTabsDetailAndChange from '@c/BugPatch/PatchTabsDetailAndChange'
import { analysisUrl } from '@u/common'

class PatchDetail extends Component {
  constructor (props) {
    super(props)
    this.state = {
      id: analysisUrl(props.location.search).id,
      detailData: {}
    }
  }

  componentDidMount () {
    const { id } = this.state
    //获取补丁详情
    this.props.dispatch({ type: 'bugPatch/getPatchDetail', payload: { param: id } })
  }

  render () {
    const { detailData } = this.props
    return (
      <div className="main-detail-content">
        {/* 详情 */}
        <PatchDetailInfo body={detailData} />
        <PatchTabsDetailAndChange props={{ type: 'detail', from: 'patch', id: analysisUrl(this.props.location.search).id }}/>
      </div>
    )
  }
}
const mapStateToProps = ({ bugPatch }) => {
  return {
    detailData: bugPatch.patchDetail
  }
}
export default  connect(mapStateToProps)(PatchDetail)
