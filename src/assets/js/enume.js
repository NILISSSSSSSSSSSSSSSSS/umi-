/**
 * 此文件为枚举性的配置，如有公用之处，可以写到该文件，进行统一管理
 * @type {{name: string, label: string, value: string}}
 */

/**
 * 需要处理重新登录的错误码
 */
const LOGINOUT_CODES = {
  NOT_PERMISSION: '403', // 没有权限
  SYS_TOKEN_EXPIRE: '421', // 您的登录状态已经失效,请重新登录
  ACCOUNT_REPEAT_LOGIN: '422', // 当前账号已有其他人使用，您被退出，请检查账号信息或联系管理员
  ACCOUNT_NOT_LOGIN: '423', // 没有登录
  ACCOUNT_FORCED_RETURN: '426', // 您的账号权限被修改，请重新登录
  SYS_TOKEN_INVALID: '427' // 无效令牌
}

/**
 * 全部
 */
const ALL_STATUS = { name: '全部', value: '' }

/**
 * 服务类型
 * @type {{name: string, label: string, value: string}}
 */
const TYPE1 = { name: '系统服务', label: '系统服务', value: '1' }
const TYPE2 = { name: '软件服务', label: '软件服务', value: '2' }
// 服务类型
const SERVE_TYPE = [
  TYPE1,
  TYPE2
]

/**
 * 软件类型
 */
const SOFT_SEARCHTYPE = [
  { name: '操作系统',
    value: 'o'
  },
  { name: '应用软件',
    value: 'a'
  }
]

/**
 * 入库状态
 * @type {{name: string, value: Number}}
 */
const STORAGEED = { name: '已入库', value: 1 }
const WAIT_STORAGE = { name: '待入库', value: 2 }
const NOT_FOUND = { name: '', value: '' }
const STATUS = [
  WAIT_STORAGE,
  STORAGEED
]
/**
 * 升级状态
 * @type {{name: string, value: string}}
 */
const UPGRADE_STATUS = [
  { name: '升级成功',
    value: 1
  },
  { name: '升级失败',
    value: 0
  }
]
/**
 * 升级方式
 * @type {{name: string, value: string}}
 */
const UPGRADE_METHOD = [
  { name: '离线升级',
    value: 0
  },
  { name: '在线升级',
    value: 1
  }
]
//补丁等级
const PATCH_LEVEL = [
  { name: '重要',
    value: '1'
  },
  { name: '中等',
    value: '2'
  },
  { name: '严重',
    value: '3'
  }
]
//补丁状态
const PATCH_STATUS = [
  { name: '通过审核',
    value: '1'
  },
  { name: '未通过审核',
    value: '2'
  }
]
//补丁来源
const PATCH_SOURCE = [
  { name: '软件厂商',
    value: 1
  },
  { name: '自主开发',
    value: 2
  }
]
//补丁热支持
const PATCH_HOT = [
  { name: '支持热补丁',
    value: '1'
  },
  { name: '不支持热补丁',
    value: '0'
  }
]
//补丁用户交互
const PATCH_INTERACTIVE = [
  { name: '需要用户交互',
    value: '1'
  },
  { name: '不需要用户交互',
    value: '0'
  }
]
//补丁联网状态
const PATCH_INTERNET = [
  { name: '需要用户联网',
    value: '1'
  },
  { name: '不需要用户联网',
    value: '0'
  }
]
//补丁独立安装
const PATCH_INSTALL = [
  { name: '需要独占方式安装',
    value: '1'
  },
  { name: '不需要独占方式安装',
    value: '0'
  }
]
//漏洞危害等级
const THREAT_GRADE = [
  { name: '超危',
    value: '4'
  },
  { name: '高危',
    value: '3'
  },
  { name: '中危',
    value: '2'
  },
  { name: '低危',
    value: '1'
  }
]
//漏洞是否有解决方案
const HAS_PLAN = [
  { name: '是',
    value: 1
  },
  { name: '否',
    value: 0
  }
]
//漏洞当前状态
const CURRENT_STATUS = [
  { name: '已入库',
    value: 1
  },
  { name: '待入库',
    value: 0
  }
]
//基准来源
const SOURCE_LIST = [
  { name: 'STIG',
    value: 1
  },
  { name: 'CIS',
    value: 2
  },
  { name: 'COMMON',
    value: 3
  }
]
//安全级别
const SOURCE_LEVEL = [
  { name: '高',
    value: 1
  },
  { name: '中',
    value: 2
  },
  { name: '低',
    value: 3
  }
]
/**
 * 语言类型
 * @type {{name: string, label: string, value: String}}
 */
export const ZH = { name: '中文', label: '中文', language: 'english', value: 'chinese' }
export const EN = { name: '英文', label: '英文', language: 'chinese', value: 'english' }
export const LANGUAGE = [ ZH, EN]
/**
 * 资产类型
 * @type {{name: string, value: String}}
 * a：应用软件,h:硬件,o:操作系统
 *  ['a', 'h', 'o']
 */
export const HARD_TYPE = { name: '硬件', value: 'HARD' }
export const SOFT_TYPE = { name: '应用软件', value: 'a' }
export const OS_TYPE = { name: '操作系统', value: 'o' }
export const ASSET_TYPE = [ SOFT_TYPE, OS_TYPE ]
export {
  LOGINOUT_CODES,
  PATCH_INSTALL,
  PATCH_INTERNET,
  PATCH_INTERACTIVE,
  PATCH_HOT,
  PATCH_SOURCE,
  PATCH_STATUS,
  PATCH_LEVEL,
  HAS_PLAN,
  SOURCE_LIST,
  SOURCE_LEVEL,
  CURRENT_STATUS,
  THREAT_GRADE,
  SERVE_TYPE,
  STATUS,
  NOT_FOUND,
  UPGRADE_STATUS,
  UPGRADE_METHOD,
  ALL_STATUS,
  WAIT_STORAGE,
  STORAGEED,
  SOFT_SEARCHTYPE
}
