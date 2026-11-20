// Copies the Transformation Explorer from its own project into this site.
//
//   npm run sync:transformation-explorer
//   node scripts/sync-transformation-explorer.mjs <path-to-ReflectionRotationInvestigation-project>
//
// Copies <source>/src/TransformationExplorer/ -> src/tools/transformation-explorer/
// (test files are left behind). Re-run it whenever the explorer changes there.
// The old copy is replaced.
import fs from 'node:fs'
import path from 'node:path'

const [source] = process.argv.slice(2)
if (!source) {
  console.error('Usage: node scripts/sync-transformation-explorer.mjs <path-to-ReflectionRotationInvestigation-project>')
  process.exit(1)
}

const from = path.join(source, 'src', 'TransformationExplorer')
if (!fs.existsSync(from)) {
  console.error(`Not found: ${from}`)
  process.exit(1)
}

const to = path.join('src', 'tools', 'transformation-explorer')
fs.rmSync(to, { recursive: true, force: true })
fs.cpSync(from, to, {
  recursive: true,
  filter: (p) => !/\.test\.[jt]sx?$/.test(p),
})

const files = fs.readdirSync(to, { recursive: true })
console.log(`transformation-explorer: copied ${files.length} files to ${to}`)
