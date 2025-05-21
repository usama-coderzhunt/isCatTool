// Define types for menu items
import { VerticalMenuContextProps } from '@/@menu/components/vertical-menu/Menu'
import { getDictionary } from '@/utils/getDictionary'

export type RenderExpandIconProps = {
    open?: boolean
    transitionDuration?: VerticalMenuContextProps['transitionDuration']
  }

  export type Props = {
    dictionary: Awaited<ReturnType<typeof getDictionary>>
    scrollMenu: (container: any, isPerfectScrollbar: boolean) => void
  }

export type MenuItemType = {
    type: 'item'
    label: string
    href: string
    icon?: string
    permission?: string[]
    exactMatch?: boolean
  }

  export type SubMenuType = {
    type: 'submenu'
    label: string
    icon?: string
    items: (MenuItemType | SubMenuType)[]
    permission?: string[]
  }

