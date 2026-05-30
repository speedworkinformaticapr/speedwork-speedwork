import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { SidebarFooterActions } from './SidebarFooterActions'

export function SidebarInjector() {
  const [container, setContainer] = useState<Element | null>(null)
  const location = useLocation()

  useEffect(() => {
    // Only inject in admin routes
    if (!location.pathname.startsWith('/admin')) {
      if (container) setContainer(null)
      return
    }

    const findContainer = () => {
      let footer = document.querySelector('[data-sidebar="footer"]')
      let content = document.querySelector('[data-sidebar="content"]')

      let targetElement = null

      if (footer) {
        // Create an isolated wrapper inside the existing footer so React portals don't clash with existing React nodes
        let wrapper = footer.querySelector('#injected-sidebar-actions')
        if (!wrapper) {
          wrapper = document.createElement('div')
          wrapper.id = 'injected-sidebar-actions'
          wrapper.className = 'w-full mt-4 border-t pt-4'
          footer.appendChild(wrapper)
        }
        targetElement = wrapper
      } else if (content && content.parentElement) {
        // If there's no footer at all, create one
        let wrapper = content.parentElement.querySelector('#injected-sidebar-footer')
        if (!wrapper) {
          wrapper = document.createElement('div')
          wrapper.id = 'injected-sidebar-footer'
          wrapper.setAttribute('data-sidebar', 'footer')
          wrapper.className = 'flex flex-col gap-2 p-4 mt-auto border-t'

          let inner = document.createElement('div')
          inner.id = 'injected-sidebar-actions'
          inner.className = 'w-full'
          wrapper.appendChild(inner)

          content.parentElement.appendChild(wrapper)
          targetElement = inner
        } else {
          targetElement = wrapper.querySelector('#injected-sidebar-actions')
        }
      }

      if (targetElement && targetElement !== container) {
        setContainer(targetElement)
      }
    }

    // Try finding the insertion point immediately
    findContainer()

    // Watch for DOM changes (e.g. sidebar mounting after layout render)
    const observer = new MutationObserver(() => {
      if (location.pathname.startsWith('/admin') && (!container || !container.isConnected)) {
        findContainer()
      }
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [location.pathname, container])

  if (!container) return null

  // Safely portal the actions into the bottom of the sidebar
  return createPortal(<SidebarFooterActions />, container)
}
