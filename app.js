/** @typedef {import('pear-interface')} */ /* global Pear */

let Hyperswarm, crypto, b4a;

async function loadModules() {
  Hyperswarm = globalThis.Hyperswarm || (await import('hyperswarm')).default
  crypto = globalThis.hypercore_crypto || (await import('hypercore-crypto')).default
  b4a = globalThis.b4a || (await import('b4a')).default
}

const PEAR_POSITIONS = [
  { x: 30, y: 30 },
  { x: 40, y: 50 },
  { x: 60, y: 40 },
  { x: 70, y: 60 },
  { x: 50, y: 30 },
  { x: 35, y: 70 },
  { x: 65, y: 25 },
  { x: 75, y: 45 },
  { x: 25, y: 50 },
  { x: 45, y: 65 },
  { x: 55, y: 55 },
  { x: 20, y: 35 },
  { x: 80, y: 30 },
  { x: 40, y: 25 },
  { x: 60, y: 70 },
  { x: 70, y: 20 },
  { x: 30, y: 60 },
  { x: 50, y: 75 },
  { x: 25, y: 25 },
  { x: 75, y: 75 }
]

const peers = new Map()
let localPeer = null
let hyperswarm = null
const connections = []

const treeElement = document.getElementById('tree')
const tooltipElement = document.getElementById('tooltip')
const peerCountElement = document.getElementById('peerCountValue')
const peerKeyElement = document.getElementById('peerKey')

async function initSwarm() {
  try {
    console.log('Initializing Hyperswarm for peartree application')
    
    hyperswarm = new Hyperswarm()
    
    Pear.teardown(() => hyperswarm.destroy())
    
    const topic = crypto.randomBytes(32)
    const topicHex = b4a.toString(topic, 'hex')
    
    const fixedTopic = crypto.data(Buffer.from('peartree-app-v1'))
    
    console.log('Joining topic:', b4a.toString(fixedTopic, 'hex'))
    
    hyperswarm.join(fixedTopic, { server: true, client: true })
    
    localPeer = {
      id: b4a.toString(hyperswarm.keyPair.publicKey, 'hex'),
      joinTime: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    peerKeyElement.textContent = localPeer.id.substring(0, 12) + '...'
    
    hyperswarm.on('connection', (conn, info) => {
      const remotePublicKey = b4a.toString(info.publicKey, 'hex')
      console.log('New connection from:', remotePublicKey)
      
      if (remotePublicKey === localPeer.id || peers.has(remotePublicKey)) {
        console.log('Skipping connection (self or already known):', remotePublicKey)
        return
      }
      
      const peerInfo = {
        id: remotePublicKey,
        joinTime: new Date().toISOString(),
        address: 'p2p-connection',
        publicKey: info.publicKey
      }
      
      console.log('Adding peer to list:', peerInfo.id)
      peers.set(remotePublicKey, peerInfo)
      connections.push(conn)
      
      updatePeers()
      
      conn.on('data', data => {
        console.log('Received data from peer:', remotePublicKey, data.toString())
      })
      
      conn.on('close', () => {
        console.log('Connection closed:', remotePublicKey)
        
        if (peers.has(remotePublicKey)) {
          peers.delete(remotePublicKey)
          
          updatePeers()
        }
        
        const index = connections.indexOf(conn)
        if (index > -1) {
          connections.splice(index, 1)
        }
      })
      
      const myInfo = JSON.stringify({
        type: 'peer-info',
        id: localPeer.id,
        joinTime: localPeer.joinTime,
        userAgent: localPeer.userAgent
      })
      
      conn.write(myInfo)
    })
    
    setTimeout(() => {
      if (peers.size === 0) {
        console.log('Adding self as peer for demonstration')
        const selfPeer = {
          id: 'self-peer-' + Math.random().toString(36).substring(2, 10),
          joinTime: new Date().toISOString(),
          address: 'local',
          isSelf: true
        }
        peers.set(selfPeer.id, selfPeer)
        updatePeers()
      }
    }, 3000)
    
    setInterval(() => {
      console.log('Current peer count:', peers.size)
      console.log('Peers:', Array.from(peers.keys()))
    }, 5000)
    
    console.log('Hyperswarm initialized with public key:', localPeer.id)
    
  } catch (error) {
    console.error('Failed to initialize Hyperswarm:', error)
  }
}

function updatePeers() {
  while (treeElement.firstChild) {
    treeElement.removeChild(treeElement.firstChild)
  }
  
  peerCountElement.textContent = peers.size
  
  let index = 0
  for (const [peerId, peerInfo] of peers.entries()) {
    const pearElement = document.createElement('div')
    pearElement.className = 'pear'
    
    if (peerInfo.isSelf) {
      pearElement.classList.add('self-peer')
    }
    
    const position = PEAR_POSITIONS[index % PEAR_POSITIONS.length]
    pearElement.style.left = `${position.x}%`
    pearElement.style.top = `${position.y}%`
    
    pearElement.dataset.peerId = peerId
    
    pearElement.addEventListener('mouseenter', showTooltip)
    pearElement.addEventListener('mouseleave', hideTooltip)
    
    treeElement.appendChild(pearElement)
    
    index++
  }
}

function showTooltip(event) {
  const pearElement = event.target
  const peerId = pearElement.dataset.peerId
  const peerInfo = peers.get(peerId)
  
  if (peerInfo) {
    let tooltipContent = `Peer ID: ${peerInfo.id.substring(0, 12)}...
Joined: ${new Date(peerInfo.joinTime).toLocaleTimeString()}
Address: ${peerInfo.address || 'unknown'}`

    if (peerInfo.isSelf) {
      tooltipContent += '\n(Demo peer)'
    }
    
    tooltipElement.textContent = tooltipContent
    tooltipElement.style.opacity = '1'
    
    const pearRect = pearElement.getBoundingClientRect()
    const treeRect = treeElement.getBoundingClientRect()
    
    tooltipElement.style.left = `${pearRect.left - treeRect.left + pearRect.width / 2}px`
    tooltipElement.style.top = `${pearRect.top - treeRect.top - tooltipElement.offsetHeight - 10}px`
  }
}

function hideTooltip() {
  tooltipElement.style.opacity = '0'
}

function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle')
  const htmlElement = document.documentElement
  
  const savedTheme = localStorage.getItem('theme')
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
    htmlElement.setAttribute('data-theme', 'dark')
    themeToggle.checked = true
  }
  
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      htmlElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      htmlElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  })
}

window.addEventListener('DOMContentLoaded', async () => {
  console.log('Peartree application starting...')
  
  await loadModules()
  
  initSwarm()
  initThemeToggle()
})
