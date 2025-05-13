/** @typedef {import('pear-interface')} */ /* global Pear */

const { versions, config, swarm } = Pear

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

const treeElement = document.getElementById('tree')
const tooltipElement = document.getElementById('tooltip')
const peerCountElement = document.getElementById('peerCountValue')
const peerKeyElement = document.getElementById('peerKey')

async function initSwarm() {
  try {
    const topic = 'peartree-app'
    
    const node = swarm.join(topic, {
      valueEncoding: 'json',
      lookup: true,
      announce: true
    })
    
    localPeer = {
      id: node.key.toString('hex'),
      joinTime: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    peerKeyElement.textContent = localPeer.id.substring(0, 12) + '...'
    
    node.on('peer-add', (peer) => {
      const peerId = peer.key.toString('hex')
      
      if (peerId === localPeer.id || peers.has(peerId)) return
      
      const peerInfo = {
        id: peerId,
        joinTime: new Date().toISOString(),
        address: peer.address ? peer.address.host + ':' + peer.address.port : 'unknown'
      }
      
      peers.set(peerId, peerInfo)
      
      updatePeers()
    })
    
    node.on('peer-remove', (peer) => {
      const peerId = peer.key.toString('hex')
      
      if (peers.has(peerId)) {
        peers.delete(peerId)
        
        updatePeers()
      }
    })
    
    console.log('Joined swarm with topic:', topic)
    console.log('Local peer ID:', localPeer.id)
    
  } catch (error) {
    console.error('Failed to initialize swarm:', error)
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
    const tooltipContent = `Peer ID: ${peerInfo.id.substring(0, 12)}...
Joined: ${new Date(peerInfo.joinTime).toLocaleTimeString()}
Address: ${peerInfo.address || 'unknown'}`
    
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

window.addEventListener('DOMContentLoaded', () => {
  console.log('Peartree application starting...')
  
  initSwarm()
})
