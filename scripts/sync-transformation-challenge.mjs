// Copies the Transformation Challenge game from its own project into this site.
//
//   npm run sync:transformation-challenge
//   node scripts/sync-transformation-challenge.mjs <path-to-transformationMaker2-project>
//
// Copies <source>/src/transformation-game/ -> src/tools/transformation-challenge/
// (test files are left behind). Re-run it whenever the game changes there.
// The old copy is replaced.
import fs from 'node:fs'
import path from 'node:path'

const [source] = process.argv.slice(2)
if (!source) {
  console.error('Usage: node scripts/sync-transformation-challenge.mjs <path-to-transformationMaker2-project>')
  process.exit(1)
}

const from = path.join(source, 'src', 'transformation-game')
if (!fs.existsSync(from)) {
  console.error(`Not found: ${from}`)
  process.exit(1)
}

const to = path.join('src', 'tools', 'transformation-challenge')
fs.rmSync(to, { recursive: true, force: true })
fs.cpSync(from, to, {
  recursive: true,
  filter: (p) => !/\.test\.[jt]sx?$/.test(p),
})

const files = fs.readdirSync(to, { recursive: true })
console.log(`transformation-challenge: copied ${files.length} files to ${to}`)
