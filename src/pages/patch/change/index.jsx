import { Component } from 'react'
import PatchChangeForm from '@c/BugPatch/PatchChangeForm'
import PatchTabsDetailAndChange from '@c/BugPatch/PatchTabsDetailAndChange'
import { analysisUrl } from '@u/common'
class PatchChange extends Component {
  constructor (props) {
    super(props)
    this.state = {
      detailData: {}
    }
  }

  componentDidMount () {

  }

  render () {
    return (
      <section className="information-register">
        <div className="main-detail-content">
          {/* 表单 */}
          <PatchChangeForm />
          <PatchTabsDetailAndChange props={{ type: 'change', from: 'patch', id: analysisUrl(this.props.location.search).id }}/>
        </div>
      </section>
    )
  }
}

export default PatchChange
