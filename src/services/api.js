import * as bug from './bug'
import * as patch from './patch'
import user from './user'
import * as parts from './parts'
import * as baseSetting from './settingServices'
import assetCom from './assetBase/assetCom.js'
import hardware from './assetBase/hardware.js'
import software from './assetBase/software.js'
import protocol from './assetBase/protocol.js'
import upgrade from './upgrade'
import indexPage from './indexPage'
import login from './login'

export default{
  ...bug,
  ...patch,
  ...user,
  ...parts,
  ...baseSetting,
  ...assetCom,
  ...hardware,
  ...software,
  ...protocol,
  ...upgrade,
  ...indexPage,
  ...login
}
