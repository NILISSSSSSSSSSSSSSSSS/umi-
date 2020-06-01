/*
 * @Description: In User Settings Edit
 * @Author: your name
 * @Date: 2019-08-08 12:03:14
 * @LastEditTime: 2019-08-20 09:56:06
 * @LastEditors: Please set LastEditors
 */
import { Tooltip, Message } from 'antd'
import qs from 'qs'
import md5 from 'js-md5'
import moment from 'moment'
import CryptoJS from 'crypto-js'
import * as regExp from '@u/validate'

//菜单及功能按钮权限验证
const hasAuth = (tag) =>{
  const menus = JSON.parse(sessionStorage.menus || '[]')
  return menus.includes(tag)
}
/**  权限验证  等着看有无此功能
 * @method validCtr  验证按钮是否有效
 * @param {string} id 按钮id
 * @returns {boolean} 是否有权限
 * * @author duuliy
 */
// global.validCtr = id => {
//   let userRight = JSON.parse(unescape(localStorage.getItem('userRight')))
//   for (let item of userRight.resRight){
//     if(id === item.ctrlId){
//       return true
//     }
//   }
//   return false
// }

/**  判断内容是否为空，为空显示占位符
 * @param str 要判断的内容
 * @return str 返回实际显示的内容
 */
const is = {
  empty: s => s === null || typeof s === 'undefined' || (typeof s === 'string' && s.replace(/\s*/g, '') === ''),
  array: s => Array.isArray(s)
}
/**
 * 递归获取节点下所有子节点ID
 * @param rootNode {Object} 节点树
 * @param handler {Function}
 */
export const foreachNode = (rootNode, handler) => {
  if (handler) {
    handler(rootNode)
  }
  let childrenNode = rootNode.childrenNode
  if (childrenNode) {
    childrenNode.forEach(item => {
      foreachNode(item, handler)
    })
  }
}
/**
 * 查找节点树
 * @param data {Object} 品类型号树
 * @param stringId {String} 节点ID
 * @returns rootNode {Object} 节点树
 */
export function findNodeByStringID (data, stringId) {
  //此处 findNodeList 充当队列的作用
  let findNodeList = []
  findNodeList.push(data)
  while(findNodeList.length > 0){
    let rootNode = findNodeList[0]
    if( rootNode.stringId === stringId){
      return rootNode
    }
    //清除队列中的第一个元素
    findNodeList.shift()
    let childrenNode = rootNode.childrenNode
    if( childrenNode){
      childrenNode.forEach(item => {
        findNodeList.push(item)
      })
    }
  }
}
/**
 * 查找节点下所有子节点
 * @param data {Object} 品类型号树
 * @param stringId {String}
 * @returns stringIdArr {Array} 子节点ID的集合
 */
export const findSubNodeStringIds = (data, stringId) => {
  let stringIdArr = []
  let findNodeData = findNodeByStringID(data, stringId)
  if(findNodeData){
    foreachNode(findNodeData, (nodeData) => {
      stringIdArr.push(nodeData.stringId)
    })
  }
  return stringIdArr
}
/**
 * 查找节点下所有子节点升级
 * @param data {Object} 品类型号树
 * @param arr {Array}
 * @returns stringIdArr {Array} 子节点ID的集合
 */
export const subNodeQuery = data=>arr=>{
  if(data && arr){
    return [...arr.map(item=>findSubNodeStringIds(data, item))].flat(Infinity)
    // return flattenDeep([...arr.map(item=>findSubNodeStringIds(data, item))])
  }
  return void(0)
}
/**  没有内容显示横杠
 * @param str 要显示的内容
 */
const emptyFilter = (str) => {
  if (is.empty(str)) return '--'
  return str
}
/**  移除对象中为空的键值对
 * @param obj 传入的对象
 */
export const removeEmpty = (obj) => {
  return Object.keys(obj).filter(key => !is.empty(obj[key])).reduce(
    (newObj, key) => {
      newObj[key] = obj[key]
      return newObj
    }, {}
  )
}

/**  气泡
 * @param text 要显示的内容
 */
const TooltipFn = text=>{
  return (
    <Tooltip getPopupContainer={triggerNode => triggerNode.parentNode} placement="topLeft" title={text}>
      {emptyFilter(text)}
    </Tooltip>
  )
}

// 解析URL中的参数
export const analysisUrl = (url) =>{
  if (!url || !url.includes('?')) return {}
  let init = {}
  let Arr = url.split('?')[1].split('&')
  for (let i of Arr){
    const arr = i.split('=')
    const key = arr[0]
    const value = arr[1]
    // 属于这些参数就进行解码
    const decodeURIID = ['relId', 'id', 'stringId', 'categoryModel', 'categoryModelId', 'categoryId', 'assetId', 'taskId', 'primaryKey', 'flowId', 'planId', 'asset', 'workOrderId']
    if(decodeURIID.includes(key)){
      init[key] = value ? decodeURIComponent(value) : ''
    }else {
      init[key] = value
    }
  }
  return init
}

/**
 * 转码uri, 不对 空('', null, undefind) 进行转换，直接返回空的 ''
 * @param str{ String} 要转义的字符串
 * @return {String} 转换过后的字符串
 */
const transliteration = (str) => {
  if(typeof str === 'number'){
    return `${str}`
  }
  return str ? encodeURIComponent(str) : ''
}

/**
 * 解码uri, 不对 空('', null, undefind) 进行转换，直接返回空的 ''
 * @param str{ String} 要解码的字符串
 * @return {String} 解码过后的字符串
 */
const _decodeURIComponent = (str) => {
  return str ? decodeURIComponent(str) : ''
}

/**
 * 动态路由获取最后一节
 */

const getUrlPathLast = that=>{
  const urlPath = that.props.history.location.pathname.split('/')
  return urlPath[urlPath.length - 1]
}

/**
   * 生成验证规则
   * @param max 最多字符数
   * @param rules {Array} 验证规则
   * @returns {*[]}
   */
const  generateRules = (max = 30, rules = []) => {
  return [
    { max, message: `最多输入${max}个字符！` },
    { whitespace: true, message: '不能为空字符！' },
    ...rules
  ]
}
/**
* 执行下载
* @method download
* @param  String url 下载地址，从/xxx开始
*/
const download = (url, values) => {
  let params = {}
  if (!values) {
    values = {}
  }
  const headers = createHeaders(values)
  params = Object.assign(headers, values)
  window.open( url + '?' + qs.stringify(params) )
}

export  const getUrlIncludePublicParam = (url, values) => {
  return window.location.origin + url + '?token=' + sessionStorage.getItem('token') + '&' + qs.stringify(values)
}

/**
 * 附件上传校验
 * @param file {object}当前上传的文件
 * @param fileLists {Array} 当前上传的文件
 * @param fileList {Array} 总共上传的文件
 * @param sizeLimit {Number} 限制上传的文件大小，默认10
 * @param sizeLimitType {String} 上传的文件大小单位，默认MB
 * @param fileTotal {Number} 上传的文件个数，默认5个
 * @param fileTypePattern {Object} RegExp,上传文件的正则匹配，默认fileTypePattern
 * @returns Promise对象的失败处理方法{Functon}
 */
const beforeUpload = (
  file,
  fileLists = [],
  fileList = [],
  sizeLimit = 10,
  sizeLimitType = 'MB',
  fileTotal = 1,
  fileTypePattern = regExp.fileTypePattern,
) => {
  // const newList = [ ...fileLists]
  const newList = [ ...fileList, ...fileLists]
  const index = newList.indexOf(file)
  const fileType = file.name.substring(file.name.lastIndexOf('.') + 1)
  const fileName = file.name.substring(0, file.name.lastIndexOf('.'))
  let init = 1024 * 1024 * sizeLimit
  if (sizeLimitType === 'GB') {
    init *= 1024
  }
  if(index >= fileTotal){
    if(index === fileTotal){
      Message.info(`上传文件不能超过${fileTotal}个`)
    }
    return Promise.reject()
  }
  if (!fileTypePattern.test(fileType)) {
    Message.info('请上传正确格式的文件')
    return Promise.reject()
  }
  if(file.size > init){
    Message.info(`请上传小于${sizeLimit}${sizeLimitType}的文件`)
    return Promise.reject()
  }
  if(file.size === 0){
    Message.info('上传文件不能为空，请重新选择')
    return Promise.reject()
  }
  if(fileName.length > 120){
    Message.info('文件名长度最多120字符，请检查')
    return Promise.reject()
  }
}
export const cache = {
  /**
   * 保留搜索条件 和页码
   * @param lists 当前页 page和param 的数组集合
   * @param history {history} 当前页路由name
   * @param mark 当前页面如果有多个表单和页码需要存储，作为标识
   * @param tagKey {string<number>} 区分是第几个标签页
   */
  cacheSearchParameter (lists, history, mark = null, tagKey = null){
    const { location: { pathname } } = history
    const init = {
      list: [],
      pageIndex: history ? pathname : '',
      tagKey
    }
    //当前页面list中是否有值
    let classify = (item, n)=>{
      for(let i = 0; i <= n; i++){
        if(i < n && n !== 0 && !item[i] ){
          item[i] = {
            page: {},
            parameter: {}
          }
        }else{
          item[n] = lists[0]
        }
      }
      return item
    }
    //判斷是否存在sessionStorage
    if(sessionStorage.searchParameter){
      let arr = JSON.parse(sessionStorage.searchParameter)
      //如果沒有跟当前页面name名称相等，就add
      if(arr.every(n=>n.pageIndex !== history.location.pathname )){
        if(mark !== null) init.list = classify(init.list, mark)
        else init.list = lists
        arr.push(init)
      }else{
        //在数组的位置
        let n = arr.findIndex(el=> el.pageIndex === pathname)
        if(mark !== null){
          arr[n].list = classify(arr[n].list, mark)
        }else{
          arr[n].list = lists
        }
      }
      sessionStorage.searchParameter = JSON.stringify(arr)
    }else{
      if(mark !== null)
        init.list = classify(init.list, mark)
      else init.list = lists
      sessionStorage.searchParameter = JSON.stringify([init])
    }
  },
  /**
   * 解析sessionStorage
   * @param parent 传来的this
   * @param obj 额外的请求参数
   * @param autoSet { Boolean } 是否自动设置
   */
  evalSearchParam (parent, obj = null, autoSet = true, mark = null ){
    //没有sessionStorage时 直接抛出去
    if(!sessionStorage.searchParameter) return void(0)
    let init = JSON.parse(sessionStorage.searchParameter)
    let result = {}
    init.forEach((item)=>{
      if( item.pageIndex === parent.props.history.location.pathname){
        let { list } = item
        let v = ['gmtCreateStart', 'gmtCreateEnd', 'enterNetStart', 'gmtCreate', 'aTime', 'bTime', 'time', 'enterNetEnd', 'beginTime', 'endTime', 'releaseStartTime', 'releaseEndTime']
        result = JSON.parse(JSON.stringify(item))
        //遍历
        list.forEach(item=>{
          //保留的参数项
          let { parameter } = item
          for(let now in parameter){
            if(v.includes(now) && parameter[now] ){
              // 时间为 range时
              if(Array.isArray(parameter[now])){
                parameter[now].forEach((ele, idx)=>{
                  ele && (parameter[now][idx] = moment(moment(ele).format('YYYY-MM-DD HH:mm:ss')))
                })
              }else {
                parameter[now] = moment(moment(parameter[now]).format('YYYY-MM-DD HH:mm:ss'))
              }
            }
          }
          if( parameter && parameter.currentPage &&  parameter.pageSize){
            delete parameter.currentPage
            delete parameter.pageSize
          }
          // 回显并且设置查询
          autoSet && parent.props.form.setFieldsValue({
            ...parameter,
            ...obj
          })
        })
      }
    })
    if(JSON.stringify(result) === '{}') return  void(0)
    return  result
  },

  /**
   * 获取缓存，有缓存返回缓存对象，没有的话，返回 undefined
   * @param parent 调用改函数的组件的this对象
   * @param autoSet { Boolean } 是否自动设置
   * @param searchIndex { Number } 路由下的第几个缓存数据，为undefind 时，返回整个路由下的缓存列表 返回为数组结构array，为数字时，返回的是路由下下标为 searchIndex 的缓存，返回的为对象结构
   * @return {boolean|array|*}
   */
  getCaches (parent, autoSet = true, searchIndex){
    if(!sessionStorage.searchParameter){
      return void 0
    }
    const cache = this.evalSearchParam(parent, {}, autoSet)
    // 有缓存时
    if(cache && cache.list && cache.list.length){
      // searchIndex  为null 或者 undefined时，返回该路由下的全部缓存
      if(!searchIndex && searchIndex !== 0){
        return cache.list
      }
      const first = cache.list[searchIndex]
      if(!first){
        return void 0
      }
      const page = Object.keys(first.page)
      const parameter = Object.keys(first.parameter)
      // 有分页缓存或者参数缓存时,返回参数缓存对象
      if(parameter.length || page.length){
        return first
      }else {
        return void 0
      }
    }
    return void 0
  },

  /**
   * 清除缓存
   */
  clear () {
    sessionStorage.removeItem('searchParameter')
  }
}

/**
 * 获取删除后的当前页码，当前页不存在数据时则递减，最小至1
 * @param total {Number} 列表总条数
 * @param currentPage { Number } 当前页码
 * @param pageSize { Number } 每页条数
 * @return {Number}
 */
export const getAfterDeletePage  = (total, currentPage, pageSize) => {
  if (Math.ceil(total / pageSize) < currentPage && currentPage !== 1) {
    return getAfterDeletePage(total, currentPage - 1, pageSize)
  }
  return currentPage
}

/**
* 加密
* @method encrypt
* @param  String word 待加密数据
*/
const encrypt = (word) => {
  const key = CryptoJS.enc.Utf8.parse('abcdefgabcdefg12')
  const srcs = CryptoJS.enc.Utf8.parse(word)
  const encrypted = CryptoJS.AES.encrypt(srcs, key, { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 })
  return encrypted.toString()
}

/**
* 删除json中的空值
* @param obj 待删除的json
* @return obj 删除后的json
*/
const deleteEmptyProp = (obj) => {
  for (let key in obj) {
    const value = obj[key]
    if (value === null) {
      delete obj[key]
    } else if (Object.prototype.toString.call(value) === '[object Object]') {
      deleteEmptyProp(value)
    }
  }
  return obj
}

/**
* 生成请求头
* @param params 传给请求接口的入参，请求头要用入参来加签
* @return headers 生成的请求头
*/
const createHeaders = (params = {}) => {
  const headers = {}

  // 设置token
  const token = sessionStorage.getItem('token')
  if (token) {
    headers.token = token
  }

  // 设置requestId
  headers.requestId = `1000000${moment().format('YYYYMMDD')}${String(Math.random()).substring(2, 11)}`

  // 设置sign
  let sign = params instanceof FormData ? {} : JSON.parse(JSON.stringify(params)) // 深拷贝参数，防止加签时原参数被改变
  sign = deleteEmptyProp(sign) // 删除空属性
  sign.key = '8db4a013a8b515349c307f1e448ce836'
  if (token) {
    sign.token = token
  }
  sign.requestId = headers.requestId
  sign = JSON.stringify(sign).split('').sort().join('')
  sign = sign.replace(/[~`!@#$%^&*()_\-+={}\[\]|\\:;"'<>,.?\/！￥……（）——【】、：；“”‘’《》，。？]/g, '')
  headers.sign = md5(sign)

  return headers
}

export {
  hasAuth,
  beforeUpload,
  TooltipFn,
  emptyFilter,
  transliteration,
  _decodeURIComponent,
  getUrlPathLast,
  generateRules,
  download,
  encrypt,
  deleteEmptyProp,
  createHeaders
}
