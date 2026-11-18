// Copies the Transformation Maker component from its own project into this site.
//
//   npm run sync:transformation-maker
//   node scripts/sync-transformation-maker.mjs <path-to-transformationMaker-project>
//
// Copies <source>/src/transformation-maker/ -> src/tools/transformation-maker/
// (test files are left behind, since this site doesn't use Vitest).
// Re-run it whenever the component changes there. The old copy is replaced.
import fs from 'node:fs'
import path from 'node:path'

const [source] = process.argv.slice(2)
if (!source) {
  console.error('Usage: node scripts/sync-transformation-maker.mjs <path-to-transformationMaker-project>')
  process.exit(1)
}

const from = path.join(source, 'src', 'transformation-maker')
if (!fs.existsSync(from)) {
  console.error(`Not found: ${from}`)
  process.exit(1)
}

const to = path.join('src', 'tools', 'transformation-maker')
fs.rmSync(to, { recursive: true, force: true })
fs.cpSync(from, to, {
  recursive: true,
  filter: (p) => !/\.test\.[jt]sx?$/.test(p),
})

const files = fs.readdirSync(to, { recursive: true })
console.log(`transformation-maker: copied ${files.length} files to ${to}`)
