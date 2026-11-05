import { useEffect } from 'react'
import { useReveal } from './useReveal'

// Shared setup for every routed page: sets the browser tab title and fades in
// the page's `.reveal` elements. Scrolling to the top on navigation is handled
// once in App (ScrollToTop).
export function usePage(title) {
  useReveal()
  useEffect(() => {
    document.title = title ? `Mr. Zeigler · ${title}` : 'Mr. Zeigler · Mathematics'
  }, [title])
}
