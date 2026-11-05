// Copies a released-items viewer's data from its "data factory" project into this site.
//
//   npm run sync:geometry
//   node scripts/sync-released-items.mjs <subject> <path-to-source-project>
//
// The source project is where the data is built (it renders the question images from
// Ohio's PDFs). This script copies two things out of it:
//   <source>/src/data/items.json  ->  src/ost/data/<subject>.json
//   <source>/public/questions/    ->  public/released-items/<subject>/questions/
// Re-run it whenever the source project's data changes. The old copy is replaced.
import fs from 'node:fs'
import path from 'node:path'

const [subject, source] = process.argv.slice(2)
if (!subject || !source) {
  console.error('Usage: node scripts/sync-released-items.mjs <subject> <path-to-source-project>')
  process.exit(1)
}
if (!/^[a-z0-9-]+$/.test(subject)) {
  console.error(`Subject must be lowercase letters, numbers, or dashes (got "${subject}").`)
  process.exit(1)
}

const itemsFrom = path.join(source, 'src', 'data', 'items.json')
const imagesFrom = path.join(source, 'public', 'questions')
for (const p of [itemsFrom, imagesFrom]) {
  if (!fs.existsSync(p)) {
    console.error(`Not found: ${p}`)
    process.exit(1)
  }
}

const itemsTo = path.join('src', 'ost', 'data', `${subject}.json`)
const imagesTo = path.join('public', 'released-items', subject, 'questions')

fs.mkdirSync(path.dirname(itemsTo), { recursive: true })
fs.copyFileSync(itemsFrom, itemsTo)

fs.rmSync(imagesTo, { recursive: true, force: true })
fs.mkdirSync(path.dirname(imagesTo), { recursive: true })
fs.cpSync(imagesFrom, imagesTo, { recursive: true })

const data = JSON.parse(fs.readFileSync(itemsTo, 'utf8'))
const items = Object.values(data.standards).flatMap((s) => s.items)
const files = fs.readdirSync(imagesTo, { recursive: true }).filter((f) => f.endsWith('.webp'))
console.log(`${subject}: ${items.length} items, ${Object.keys(data.standards).length} standards, ${files.length} images`)

// Catch images the data points to that didn't come across.
const missing = items
  .flatMap((i) => [...(i.images ?? []), ...(i.scoringImages ?? [])])
  .filter((p) => !fs.existsSync(path.join('public', 'released-items', subject, p)))
if (missing.length) {
  console.warn(`Warning: ${missing.length} image(s) referenced in the data are missing, e.g. ${missing[0]}`)
}
