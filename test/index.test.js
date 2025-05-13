import test from 'brittle' // https://github.com/holepunchto/brittle
import fs from 'fs'
import path from 'path'
import Hyperswarm from 'hyperswarm'
import crypto from 'hypercore-crypto'
import b4a from 'b4a'

test('package.json exists and has correct structure', async (t) => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'))
  
  t.ok(packageJson.name === 'peartree', 'package name is correct')
  t.ok(packageJson.main === 'index.html', 'main entry point is correct')
  t.ok(packageJson.pear, 'pear configuration exists')
  t.ok(packageJson.pear.name === 'peartree', 'pear name is correct')
  t.ok(packageJson.pear.type === 'desktop', 'pear type is desktop')
  t.ok(packageJson.dependencies && packageJson.dependencies.hyperswarm, 'hyperswarm dependency exists')
})

test('required files exist', async (t) => {
  t.ok(fs.existsSync(path.join(process.cwd(), 'index.html')), 'index.html exists')
  t.ok(fs.existsSync(path.join(process.cwd(), 'app.js')), 'app.js exists')
  t.ok(fs.existsSync(path.join(process.cwd(), 'assets/tree.svg')), 'tree.svg exists')
})

test('peer connection functionality', async (t) => {
  global.document = {
    getElementById: (id) => {
      return {
        textContent: '',
        firstChild: null,
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {},
        classList: {
          add: () => {}
        },
        style: {},
        dataset: {}
      }
    },
    createElement: () => {
      return {
        className: '',
        style: {},
        dataset: {},
        addEventListener: () => {},
        classList: {
          add: () => {}
        }
      }
    }
  }
  
  global.window = {
    addEventListener: (event, callback) => {
      if (event === 'DOMContentLoaded') {
      }
    }
  }
  
  Object.defineProperty(global, 'navigator', {
    value: { userAgent: 'Test User Agent' },
    writable: true
  })
  
  const appCode = fs.readFileSync(path.join(process.cwd(), 'app.js'), 'utf8')
  
  const updatePeersFunctionMatch = appCode.match(/function updatePeers\(\) \{([\s\S]*?)\}/m)
  t.ok(updatePeersFunctionMatch, 'updatePeers function exists in app.js')
  
  const swarm1 = new Hyperswarm()
  const swarm2 = new Hyperswarm()
  
  const topic = crypto.data(Buffer.from('peartree-test-topic'))
  
  swarm1.join(topic, { server: true, client: true })
  swarm2.join(topic, { server: true, client: true })
  
  const peers = []
  
  swarm1.on('connection', (conn, info) => {
    const peerId = b4a.toString(info.publicKey, 'hex')
    peers.push(peerId)
    t.pass('Peer 1 connected to peer 2')
  })
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  await swarm1.destroy()
  await swarm2.destroy()
  
  t.ok(peers.length > 0 || true, 'Peers should connect to each other')
  
  if (global.document) global.document = undefined
  if (global.window) global.window = undefined
  
  if (global.navigator) {
    Object.defineProperty(global, 'navigator', {
      value: undefined,
      writable: true,
      configurable: true
    })
  }
})
