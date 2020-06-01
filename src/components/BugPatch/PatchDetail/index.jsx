import { Fragment } from 'react'
import { Row, Col } from 'antd'
import moment from 'moment'
import { PATCH_SOURCE, PATCH_STATUS, PATCH_LEVEL, PATCH_HOT, PATCH_INTERACTIVE, PATCH_INTERNET, PATCH_INSTALL } from '@a/js/enume'

const span = { xxl: 6, xl: 8 }
const blockSpan = { xxl: 24, xl: 24 }

export default ({ body = {} }) => {
  return (
    <Fragment>
      <p className="detail-title">补丁信息</p>
      <div className="detail-content detail-content-layout">
        <Row>
          <Col {...span}><span className="detail-content-label">补丁安天编号：</span>{body.antiyPatchNumber}</Col>
          <Col {...span}><span className="detail-content-label">补丁等级：</span>{body.patchLevel && PATCH_LEVEL.filter(item => item.value === body.patchLevel)[0].name}</Col>
          <Col {...span}><span className="detail-content-label">补丁状态：</span>{body.patchStatus && PATCH_STATUS.filter(item => item.value === body.patchStatus)[0].name}</Col>
          <Col {...span}><span className="detail-content-label">补丁编号：</span>{body.patchNumber}</Col>
          <Col {...span}><span className="detail-content-label">补丁来源：</span>{body.patchSource && PATCH_SOURCE.filter(item => item.value === body.patchSource)[0].name}</Col>
          <Col {...span}><span className="detail-content-label">补丁名称：</span>{body.patchName}</Col>
          <Col {...span}><span className="detail-content-label">补丁热支持：</span>
            {body.hotfix && PATCH_HOT.filter(item => item.value === body.hotfix)[0].name}
          </Col>
          <Col {...span}><span className="detail-content-label">发布时间：</span>
            {body.publishTime && moment(body.publishTime - 0).format('YYYY-MM-DD')}
          </Col>
          <Col {...span}><span className="detail-content-label">用户交互：</span>
            {body.userInteraction && PATCH_INTERACTIVE.filter(item => item.value === body.userInteraction)[0].name}
          </Col>
          <Col {...span}><span className="detail-content-label">补丁信息来源：</span>{body.patchInfoFrom}</Col>
          <Col {...span}><span className="detail-content-label">独占方式安装：</span>
            {body.exclusiveInstall && PATCH_INSTALL.filter(item => item.value === body.exclusiveInstall)[0].name}
          </Col>
          <Col {...span}><span className="detail-content-label">当前状态：</span>{body.warehousingStatusName}</Col>
          <Col {...span}><span className="detail-content-label">联网状态：</span>
            {body.networkStatus && PATCH_INTERNET.filter(item => item.value === body.networkStatus)[0].name}
          </Col>
          <Col {...blockSpan}><span className="detail-content-label">补丁描述：</span>{body.description}</Col>
          <Col {...blockSpan}><span className="detail-content-label">卸载步骤：</span>{body.uninstallStep}</Col>
          <Col {...blockSpan}><span className="detail-content-label">补丁审核意见：</span>{body.patchAuditOpinions}</Col>
        </Row>
      </div>
    </Fragment>
  )
}
