# Native WebSocket Playground

A polished and lightweight real-time chat application built with the native WebSocket library. This project demonstrates how to create a simple WebSocket server and connect to it from a browser-based client without relying on external wrappers or frameworks.

## Overview

Native WebSocket Playground is a small but practical implementation of a real-time communication system. It allows multiple users to connect to a shared server, join with a username, and exchange chat messages instantly.

The project is designed to be easy to run locally, simple to understand, and straightforward to deploy.

## Features

- Real-time bidirectional communication using WebSockets
- Browser-based chat interface
- User join and disconnect handling
- Live event console for connection activity
- Automatic client URL detection for deployment-friendly usage
- Lightweight server built with Node.js and Express

## Tech Stack

- Node.js
- Express
- WebSocket API
- ws library
- Vanilla JavaScript for the client UI

## Project Structure

```text
src/
├── app.js          # Express server and WebSocket logic
├── server.js       # Server bootstrap
└── public/         # Static frontend assets
    ├── index.html
    ├── script.js
    └── style.css
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js (recommended: v18 or newer)
- npm

### Installation

Clone the repository and install dependencies:

```bash
npm install
```

### Run Locally

Start the server:

```bash
npm start
```

For development with auto-reload support:

```bash
npm run dev
```

Then open your browser and visit:

```text
http://localhost:8080
```

## Usage

1. Open the application in your browser.
2. Enter a username.
3. Click Connect.
4. Start sending messages in real time.

The client automatically detects the current host and builds the appropriate WebSocket URL, so in most cases you do not need to manually edit the connection address.

## Deployment

The server is configured to listen on a deployment-friendly host and port:

- Host: defaults to `0.0.0.0`
- Port: defaults to `8080`

When deploying to a platform such as Render, Railway, or similar services, the platform can provide the required port through the environment automatically.

### Example deployment note

If your hosting provider sets a port dynamically, it will be picked up automatically through the environment variable configuration.

## Notes

This project is ideal for:

- learning WebSocket fundamentals
- testing real-time communication patterns
- building simple collaborative or chat-based demos

## License

This project is licensed under the ISC License.

## Author

Prantik Kundu
