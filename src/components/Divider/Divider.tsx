import { classNames } from 'app/functions'

export const Divider = ({ color = 'grey', size = 1 }: { color?: string; size?: number }) => {
  const COLORS = { grey: 'grey-linear-gradient dark:grey-linear-gradient-dark' }
  return <div className={classNames(COLORS[color])} style={{ height: `${size}px` }}></div>
}
