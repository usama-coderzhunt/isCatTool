"use client"

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Type Imports
import type { getDictionary } from '@/utils/getDictionary'
import type { VerticalMenuContextProps } from '@menu/components/vertical-menu/Menu'

// Component Imports
import { Menu, SubMenu, MenuItem, MenuSection } from '@menu/vertical-menu'
import CustomChip from '@core/components/mui/Chip'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Menu Data Imports
import menuData from '@/data/navigation/verticalMenuData.json'

import { useAuthStore } from '@/store/useAuthStore'

// Utility function to check permissions
import { hasPermissions } from '@/utils/permissionUtils'
import { RenderExpandIconProps, MenuItemType, SubMenuType, Props } from '@/types/apps/verticalMenuTypes'



const RenderExpandIcon = ({ open, transitionDuration }: RenderExpandIconProps) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

const VerticalMenu = ({ dictionary, scrollMenu }: Props) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const userPermissions = useAuthStore(state => state.userPermissions)
  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params as { lang: string }

  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  // Render a menu item
  const renderMenuItem = (item: MenuItemType) => {
    if (item.permission && !hasPermissions(userPermissions, item.permission)) {
      return null
    }

    return (
      <MenuItem
        key={item.label}
        href={`/${locale}${item.href}`}
        icon={item.icon ? <i className={item.icon} /> : undefined}
        exactMatch={item.exactMatch !== undefined ? item.exactMatch : false}
        activeUrl={item.href}
      >
        {dictionary['navigation'][item.label as keyof typeof dictionary['navigation']]}
      </MenuItem>
    )
  }

  // Add this helper function to check if any child items are visible
  const hasVisibleChildren = (items: (MenuItemType | SubMenuType)[]): boolean => {
    return items.some(item => {
      if (item.type === 'item') {
        return !item.permission || hasPermissions(userPermissions, item.permission)
      } else if (item.type === 'submenu') {
        // Check submenu's own permission first
        if (item.permission && !hasPermissions(userPermissions, item.permission)) {
          return false
        }
        // Then check its children
        return hasVisibleChildren(item.items)
      }
      return false
    })
  }

  // Modify renderSubMenu to use the new helper
  const renderSubMenu = (subMenu: SubMenuType) => {
    // Check submenu's own permission first
    if (subMenu.permission && !hasPermissions(userPermissions, subMenu.permission)) {
      return null
    }

    // Check if there are any visible children
    if (!hasVisibleChildren(subMenu.items)) {
      return null
    }

    return (
      <SubMenu
        key={subMenu.label}
        label={dictionary['navigation'][subMenu.label as keyof typeof dictionary['navigation']]}
        icon={subMenu.icon ? <i className={subMenu.icon} /> : undefined}
      >
        {subMenu.items.map(item => {
          if (item.type === 'item') {
            return renderMenuItem(item as MenuItemType)
          } else if (item.type === 'submenu') {
            return renderSubMenu(item as SubMenuType)
          }
          return null
        })}
      </SubMenu>
    )
  }

  return (
    <ScrollWrapper
      className='bs-full overflow-y-auto overflow-x-hidden'
      onScroll={container => scrollMenu(container, false)}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {menuData.sections.map(section => (
          <MenuSection key={section.label} label={dictionary['navigation'][section.label as keyof typeof dictionary['navigation']]}>
            {section.items.map(item => {
              if (item.type === 'item') {
                return renderMenuItem(item as MenuItemType)
              } else if (item.type === 'submenu') {
                return renderSubMenu(item as SubMenuType)
              }
              return null
            })}
          </MenuSection>
        ))}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu

