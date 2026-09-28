import { useEffect } from 'react'
import Calendar from './Calendar'
import { useReveal } from './useReveal'

export default function CalendarPage() {
  useReveal()
  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = 'Mr. Zeigler · Calendar'
    return () => {
      document.title = 'Mr. Zeigler · Mathematics'
    }
  }, [])
  return <Calendar />
}
