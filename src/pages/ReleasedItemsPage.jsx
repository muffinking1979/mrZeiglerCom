import { useParams } from 'react-router-dom'
import { subjects } from '../ost/subjects'
import ReleasedItemsViewer from '../ost/ReleasedItemsViewer'
import NotFoundPage from './NotFoundPage'

export default function ReleasedItemsPage() {
  const key = useParams().subject
  const subject = subjects[key]
  if (!subject?.releasedItems) return <NotFoundPage />
  return <ReleasedItemsViewer key={key} subjectKey={key} subject={subject} />
}
