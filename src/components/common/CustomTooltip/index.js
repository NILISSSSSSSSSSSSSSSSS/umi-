import { Tooltip } from 'antd'
import { emptyFilter } from '@u/common'
//
export default ({ title, children, ...other }) => {
  let component = ''
  if(typeof children === 'string' || !children){
    component = <span className="table-tooltop text-ellipsis">{emptyFilter(title)}</span>
  }else {
    component = children
  }
  return (
    <Tooltip title={title === '--' ? '' : title} placement="top" { ...other} getPopupContainer={triggerNode => triggerNode.parentNode}>
      { component }
    </Tooltip>
  )
}
