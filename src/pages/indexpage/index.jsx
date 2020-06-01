
import { Component } from 'react'
import echarts from 'echarts'
import moment from 'moment'
import api from '@/services/api'
import './style.less'

const assetsColor = '#3842B6'
const SetColor = '#5377FF'
const bugColor = '#3AA6FF'
const patchColor = '#3CCFDD'

class IndexPage extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showBugData: false,
      showPatchData: false,
      showBaselineData: false,
      showAssetData: false,
      patchTotal: 0,
      baselineTotal: 0,
      bugTotal: 0,
      assetTotal: 0
    }
  }
  componentDidMount () {
    this.getAssetsTotal()
    this.getAssetsData()
    this.getSetData()
    this.getBugData()
    this.getPatchData()
  }
  getAssetsTotal = () => {
    api.assetTotal().then(response => {
      this.setState({
        assetTotal: response.data.body
      })
    })
  }
  getAssetsData = () => {
    api.assetReport().then(response => {
      this.setState({
        showAssetData: true
      }, () => {
        this.initAssetsChart(response.data.body)
      })
    })
  }
  getSetData = () => {
    api.baselineReport().then(response => {
      this.setState({
        showBaselineData: true,
        baselineTotal: response.data.body.total
      }, () => {
        this.initSetChart(response.data.body)
      })
    })
  }
  getBugData = () => {
    api.bugReport().then(response => {
      this.setState({
        showBugData: true,
        bugTotal: response.data.body.total
      }, () => {
        this.initBugChart(response.data.body)
      })
    })
  }
  getPatchData = () => {
    api.patchReport().then(response => {
      this.setState({
        showPatchData: true,
        patchTotal: response.data.body.total
      }, () => {
        this.initPatchChart(response.data.body)
      })
    })
  }
  initAssetsChart = (data) => {
    const assetsChart = echarts.init(document.getElementById('assets-charts'))
    this.initCharts(assetsChart, assetsColor, data)
  }
  initSetChart = (data) => {
    const assetsChart = echarts.init(document.getElementById('set-charts'))
    this.initCharts(assetsChart, SetColor, data)
  }
  initBugChart = (data) => {
    const assetsChart = echarts.init(document.getElementById('bug-charts'))
    this.initCharts(assetsChart, bugColor, data)
  }
  initPatchChart = (data) => {
    const assetsChart = echarts.init(document.getElementById('patch-charts'))
    this.initCharts(assetsChart, patchColor, data)
  }
  //折线图
  initCharts = (chart, color, data) => {
    const options = {
      tooltip: {
        trigger: 'axis'
      },
      xAxis: {
        type: 'category',
        data: data.xData,
        axisLine: {
          lineStyle: {
            color: '#8B909A'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            width: 0,
            color: '#8B909A'
          }
        },
        axisTick: false, // 取消刻度线
        splitLine: {
          show: true,
          lineStyle: {
            color: ['#E7EBEF'],
            width: 1,
            type: 'solid'
          }
        }
      },
      series: [{
        type: 'line',
        smooth: true,
        lineStyle: {
          color
        },
        itemStyle: {
          normal: {
            color
          }
        },
        data: data.yData
      }]
    }
    chart.setOption(options)
    chart.resize()
    window.addEventListener('resize', () => {
      chart.resize()
    })
  }
  render () {
    const { assetTotal, patchTotal, bugTotal, baselineTotal, showBugData, showAssetData, showPatchData, showBaselineData } = this.state
    // const userInfo = sessionStorage.getItem('userInfo')
    return (
      <div className="index-page">
        <div className="overview-bar">
          <ul className="data-overview">
            <li>
              <div>
                <h2>{assetTotal}</h2>
                <p>资产知识库</p>
              </div>
              <img
                src={require('@a/images/group1.png')}
                alt=""/>
            </li>
            <li>
              <div>
                <h2>{baselineTotal}</h2>
                <p>基准知识库</p>
              </div>
              <img
                src={require('@a/images/group2.png')}
                alt=""/>
            </li>
            <li>
              <div>
                <h2>{bugTotal}</h2>
                <p>漏洞知识库</p>
              </div>
              <img
                src={require('@a/images/group3.png')}
                alt=""/>
            </li>
            <li>
              <div>
                <h2>{patchTotal}</h2>
                <p>补丁知识库</p>
              </div>
              <img
                src={require('@a/images/group4.png')}
                alt=""/>
            </li>
          </ul>
          {/* <div className="base-info">
            <div className="base-info-content">
              <img
                className="user-icon"
                src={require('@a/images/user.png')}
                alt=""/>
              <div className="info">
                <p className="user">{userInfo ? JSON.parse(userInfo).username : '--'}</p>
                <p className="time">上次登录时间：{ userInfo ? moment(userInfo.lastLoginTIme).format('YYYY-MM-DD HH:mm:ss') : '--'}</p>
              </div>
            </div>
          </div> */}
        </div>
        <div className="charts-containers">
          <div className="charts-box">
            <p className="title">资产知识库历史7天新增情况</p>
            {showAssetData
              ? <div id="assets-charts"  style={{ width: '100%', height: 400 }}></div>
              : <div className="empty-chart"><p>暂无数据</p></div>
            }
          </div>
          <div className="charts-box">
            <p className="title">基准知识库历史7天新增情况</p>
            {showBaselineData
              ? <div id="set-charts"  style={{ width: '100%', height: 400 }}></div>
              : <div className="empty-chart"><p>暂无数据</p></div>
            }
          </div>
        </div>
        <div className="charts-containers">
          <div className="charts-box">
            <p className="title">漏洞知识库历史7天新增情况</p>
            {showBugData
              ? <div id="bug-charts"  style={{ width: '100%', height: 400 }}></div>
              : <div className="empty-chart"><p>暂无数据</p></div>
            }
          </div>
          <div className="charts-box">
            <p className="title">补丁知识库历史7天新增情况</p>
            {showPatchData
              ? <div id="patch-charts"  style={{ width: '100%', height: 400 }}></div>
              : <div className="empty-chart"><p>暂无数据</p></div>
            }
          </div>
        </div>
      </div>
    )
  }
}
export default IndexPage
