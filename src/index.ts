#! /usr/bin/env node
import { exec } from 'child_process'
import { readdirSync, unlinkSync, writeFileSync } from 'fs'
import { sync as mkdirpSync } from 'mkdirp'
import { basename, join } from 'path'
import { sync as rimrafSync } from 'rimraf'
import { promisify } from 'util'
import yargs from 'yargs'
const execP = promisify(exec)
const files = readdirSync(process.cwd())
const { argv } = yargs.option('ext', {
  alias: 't',
  default: '.ts',
  description: 'file type: .ts|.js, default to .ts',
})

const { ext } = argv

interface ModuleData {
  moduleName: string
  exportKeys: string[]
}

const scripts = files
  .filter((f) => f.endsWith(ext))
  .map((f) => basename(f, ext))

if (scripts.length === 0) {
  console.log('No files found, exiting...')
  process.exit(1)
}

const handleTs = async (scripts: string[]) => {
  const hasIndex = scripts.findIndex((f) => f === 'index')
  if (hasIndex >= 0) {
    console.log(`index${ext} already exists, removing...`)
    unlinkSync(`index${ext}`)
    scripts.splice(hasIndex, 1)
  }
  const tmp = '__tmp__'
  mkdirpSync(tmp)
  await execP(
    `tsc --outDir ${tmp} --allowJs --module commonjs --esModuleInterop --moduleResolution node --target ES2019 ./*${ext}`,
  )

  const ms: ModuleData[] = await Promise.all(
    scripts.map(async (s) => {
      const m = await import(join(process.cwd(), tmp, s))
      return { moduleName: s, exportKeys: Object.keys(m) }
    }),
  )

  const hasExport = ms.filter((m) => m.exportKeys.length)

  const total = hasExport
    .map((m) =>
      m.exportKeys.map((e) =>
        e === 'default' ? `${m.moduleName}.default as ${m.moduleName}` : e,
      ),
    )
    .reduce((acc, cur) => [...acc, ...cur], [])

  console.log(total)
  console.log(`${total.length} exports found`)

  const statements = hasExport
    .map((m) => {
      const { moduleName, exportKeys } = m
      let s = `export * from './${moduleName}'\n`
      if (exportKeys.includes('default')) {
        s = `import ${moduleName} from './${moduleName}'\nexport {${moduleName}}\n${s}`
      }
      return s
    })
    .join('\n')

  writeFileSync(`index${ext}`, statements)
  rimrafSync(tmp)
}

handleTs(scripts)
