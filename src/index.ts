#! /usr/bin/env node
import { readdirSync, writeFileSync } from 'fs'
import { join, basename, sep } from 'path'

const files = readdirSync(process.cwd())

const ext = files.find((f) => f.endsWith('.ts')) ? '.ts' : '.js'

const scripts = files.filter((f) => f.endsWith(ext))
if (scripts.length === 0) {
  process.exit(1)
}

const hasIndex = scripts.findIndex((f) => basename(f, ext) === 'index')
if (hasIndex >= 0) {
  console.log(`index${ext} already exists, removing...`)
  scripts.splice(hasIndex, 1)
}

console.log(scripts)

const statements = scripts
  .map((f) => `export * from '.${sep}${basename(f, ext)}'`)
  .join('\n')

console.log(statements)
writeFileSync(join(process.cwd(), `index${ext}`), statements)
