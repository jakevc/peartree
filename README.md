# Peartree

A peer-to-peer desktop application built with Holepunch that visualizes connected peers as pears on a tree.

## Overview

Peartree is a desktop application that demonstrates the power of peer-to-peer connectivity using Holepunch's Hyperswarm technology. The application displays a stylized tree with green pears that represent connected peers. Each time a new peer connects to the network, a new pear appears on the tree.

## Features

- **Visual Peer Representation**: Each connected peer appears as a green pear on the tree
- **Peer Information**: Hover over any pear to see information about that peer
- **Light/Dark Mode**: Toggle between light and dark themes with the sun/moon icon
- **Natural Staggering**: Pears are naturally staggered on branches for a more organic look
- **Responsive Design**: The application scales properly with window size

## Installation

To install and run Peartree:

```bash
# Clone the repository
git clone https://github.com/jakevc/peartree.git

# Navigate to the project directory
cd peartree

# Install dependencies
npm install
```

## Usage

To start the application:

```bash
# Run the application
npx pear run .
```

### Connecting Multiple Peers

To see the peer connection functionality in action, you can run multiple instances of the application:

1. Open a terminal and run: `npx pear run .`
2. Open another terminal and run: `npx pear run .` again
3. Each instance will automatically discover and connect to other instances
4. Watch as new pears appear on the tree for each connected peer

## How It Works

Peartree uses Hyperswarm, a distributed networking stack for peer-to-peer applications. Here's how it works:

1. When the application starts, it creates a Hyperswarm instance
2. The application joins a fixed topic to enable peer discovery
3. When another peer connects, the application adds a new pear to the tree
4. Peer information is exchanged and displayed in tooltips
5. When a peer disconnects, its pear is removed from the tree

## Development

### Running Tests

```bash
# Run tests
npm test
```

### CI/CD

The repository includes GitHub Actions workflows for continuous integration:

- Tests are automatically run on push to main and pull requests
- The workflow ensures that all tests pass before merging

## Technologies Used

- **Holepunch**: Core P2P platform
- **Hyperswarm**: Distributed peer discovery and connectivity
- **Pear**: Holepunch's desktop application framework
- **JavaScript**: Core programming language
- **SVG**: Vector graphics for the tree and pears
- **CSS**: Styling with responsive design

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
