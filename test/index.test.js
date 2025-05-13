import test from 'brittle' // https://github.com/holepunchto/brittle
import fs from 'fs'
import path from 'path'

test('package.json exists and has correct structure', async (t) => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
  
  t.ok(packageJson.name === 'peartree', 'package name is correct')
  t.ok(packageJson.main === 'index.html', 'main entry point is correct')
  t.ok(packageJson.pear, 'pear configuration exists')
  t.ok(packageJson.pear.name === 'peartree', 'pear name is correct')
  t.ok(packageJson.pear.type === 'desktop', 'pear type is desktop')
})

test('required files exist', async (t) => {
  t.ok(fs.existsSync(path.join(process.cwd(), 'index.html')), 'index.html exists')
  t.ok(fs.existsSync(path.join(process.cwd(), 'app.js')), 'app.js exists')
  t.ok(fs.existsSync(path.join(process.cwd(), 'assets/tree.svg')), 'tree.svg exists')
})
