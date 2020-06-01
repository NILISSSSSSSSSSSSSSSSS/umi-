import axios from 'axios'
import qs from 'qs'
import { message } from 'antd'
import { createHeaders } from './common'
import { LOGINOUT_CODES } from '@a/js/enume'

function checkStatus (res) {
  const loginoutCodes = Object.keys(LOGINOUT_CODES).map(key => LOGINOUT_CODES[key])
  if (res.status >= 200 && res.status < 300) {
    if (res.data.head.code === '200') {
      return res
    } else if (loginoutCodes.indexOf(res.data.head.code) !== -1) { // token过期
      sessionStorage.clear()
      window.location.href = '/#/login'  //登录有了开
    }
  }

  const error = new Error(res.statusText)
  // error.response = res
  res.response = res
  throw res
}

function catchCB (err) {
  let msg
  if (err && err.message === 'Failed to fetch') {
    msg = '网络异常，请检查网络连接'
  } else if (err.response.status === 404) {
    msg = '找不到该请求'
  } else {
    // msg = `${url} 接口请求错误 ${err && err.response ? `${err.response.status}: ${err.response.statusText}` : ''}`
    // 后台失去连接时
    if (typeof err.response.data === 'string') {
      msg = '请求失败'
    } else if (typeof err.response.data.body === 'string') {
      if (!err.response.data.body) {
        msg = `${err.response.data.head.result}`
      } else {
        msg = `${err.response.data.body}`
      }
    } else if (typeof err.response.data.body === 'object') {
      msg = `${err.response.data.body.data || err.response.data.body.msg }`
    } else {
      msg = `${err.response.data.head.result}`
    }
  }
  return msg
}

function errPrompt (msg) {
  message.destroy()
  message.error(msg)
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} type       The type we want to request
 * @param  {string} url       The URL we want to request
 * @param  {object} data The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
const fetch = (method, url, data = {}) => {
  url = `/api/v1${url}`

  // 由于ID加密，密文可能存在特殊字符，如"/"，无法用url传参，所以所有get请求都改为post请求
  // 疑问：为什么不用encodeURIComponent对url中的参数进行编码来避免以上问题，而要通过get改post的方式来解决？
  method = 'post'

  const headers = createHeaders(data)

  // 当请求为非上传类型时，设置Content-Type
  if (!(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json; charset=UTF-8'
  }

  // 处理参数
  if (method === 'post') {
    if (!(data instanceof FormData)) {
      // post请求设置参数
      data = JSON.stringify(data)
    }

    // 发起请求
    return new Promise((resolve, reject) => {
      axios({
        method: method,
        url: url,
        data: data,
        headers: headers
      })
        .then(checkStatus)
        .then(res=>{
          res.body = res.data.body
          resolve(res)
        })
        .catch(err => {
          const msg = catchCB(err)
          errPrompt(msg)
          reject(err)
        })
    })
  } else {
    // get请求设置参数
    url = `${url}?${qs.stringify(data)}`

    // 发起请求
    return new Promise((resolve, reject) => {
      axios.get(url, {
        headers: headers
      })
        .then(checkStatus)
        .then(res=>{
          res.body = res.data.body
          resolve(res)
        })
        .catch(err => {
          const msg = catchCB(err)
          errPrompt(msg)
          // reject(new Error(err))  //统一处理后其实不用返出去
        })
    })
  }
}

export default fetch
