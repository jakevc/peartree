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
let swarmNode = null

const treeElement = document.getElementById('tree')
const tooltipElement = document.getElementById('tooltip')
const peerCountElement = document.getElementById('peerCountValue')
const peerKeyElement = document.getElementById('peerKey')

async function initSwarm() {
  try {
    const topic = Buffer.from('peartree-app-fixed-topic-v1')
    
    console.log('Initializing swarm with topic:', topic.toString('hex'))
    
    swarmNode = swarm.join(topic, {
      valueEncoding: 'json',
      lookup: true,
      announce: true,
      multiplex: true
    })
    
    localPeer = {
      id: swarmNode.key.toString('hex'),
      joinTime: new Date().toISOString(),
      userAgent: navigator.userAgent
    }
    
    peerKeyElement.textContent = localPeer.id.substring(0, 12) + '...'
    
    swarmNode.on('connection', (connection, info) => {
      console.log('New connection:', info)
    })
    
    swarmNode.on('peer-add', (peer) => {
      const peerId = peer.key.toString('hex')
      console.log('Peer added:', peerId)
      
      if (peerId === localPeer.id || peers.has(peerId)) {
        console.log('Skipping peer (self or already known):', peerId)
        return
      }
      
      const peerInfo = {
        id: peerId,
        joinTime: new Date().toISOString(),
        address: peer.address ? peer.address.host + ':' + peer.address.port : 'unknown'
      }
      
      console.log('Adding peer to list:', peerInfo)
      peers.set(peerId, peerInfo)
      
      updatePeers()
    })
    
    swarmNode.on('peer-remove', (peer) => {
      const peerId = peer.key.toString('hex')
      console.log('Peer removed:', peerId)
      
      if (peers.has(peerId)) {
        peers.delete(peerId)
        
        updatePeers()
      }
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
      
      try {
        swarmNode.update()
        console.log('Forced swarm update')
      } catch (e) {
        console.error('Error updating swarm:', e)
      }
    }, 5000)
    
    console.log('Joined swarm with topic:', topic.toString('hex'))
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

window.addEventListener('DOMContentLoaded', () => {
  console.log('Peartree application starting...')
  
  initSwarm()
})
