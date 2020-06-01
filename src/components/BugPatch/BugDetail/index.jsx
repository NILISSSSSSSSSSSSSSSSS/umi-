import { Fragment } from 'react'
import { Row, Col } from 'antd'
import moment from 'moment'

const span = { xxl: 6, xl: 8 }
const blockSpan = { xxl: 24, xl: 24 }

export default ({ body = {} }) => {
  const cvss = body.cvss || []
  return (
    <Fragment>
      <p className="detail-title">漏洞信息</p>
      <div className="detail-content detail-content-layout">
        <Row>
          <Col {...span}><span className="detail-content-label">安天编号：</span>{body.antiyVulnId}</Col>
          <Col {...span}><span className="detail-content-label">漏洞名称：</span>{body.vulnName}</Col>
          <Col {...span}><span className="detail-content-label">CVE编号：</span>{body.cveId}</Col>
          <Col {...span}><span className="detail-content-label">CNNVD编号：</span>{body.cnnvdId}</Col>
          <Col {...span}><span className="detail-content-label">CNVD编号：</span>{body.cnvdId}</Col>
          <Col {...span}><span className="detail-content-label">当前状态：</span>{body.warehousingStatus === 0 ? '待入库' : body.warehousingStatus === 1 ? '已入库' : ''}</Col>
          <Col {...span}><span className="detail-content-label">漏洞类型：</span>{body.vulnTypeStr}</Col>
          <Col {...span}><span className="detail-content-label">危害级别：</span>{body.warnLevelStr}</Col>
          <Col {...span}><span className="detail-content-label">漏洞来源：</span>{body.source}</Col>
          <Col {...span}><span className="detail-content-label">CVSS：</span>{cvss.length ? cvss[0] : ''}</Col>
          <Col {...span}><span className="detail-content-label">漏洞发布时间：</span>
            {body.publishedDate && moment(body.publishedDate).format('YYYY-MM-DD')}
          </Col>
          <Col {...span}><span className="detail-content-label">漏洞收录时间：</span>
            {body.gmtCreate && moment(body.gmtCreate).format('YYYY-MM-DD HH:mm:ss')}
          </Col>
          <Col {...span}><span className="detail-content-label">漏洞修改时间：</span>
            {body.gmtModified && moment(body.gmtModified).format('YYYY-MM-DD HH:mm:ss')}
          </Col>
          <Col {...blockSpan}><span className="detail-content-label">漏洞描述：</span>{body.description}</Col>
        </Row>
      </div>
    </Fragment>
  )
}
