# DESR Server SDK

A production-ready Node.js backend SDK for the DESR AR Restaurant System.

## Features

- 🍽️ **Order Management** - Full CRUD with status tracking
- 📋 **Menu Management** - Dynamic menu with SDK integration
- 🪑 **Table Sessions** - Session-based table tracking
- 🔄 **Real-time Updates** - WebSocket notifications
- 👨‍🍳 **Kitchen Dashboard** - Ready-to-use order display

## Quick Start

```bash
# Install dependencies
cd desr-server
npm install

# Start server
npm start
```

Server runs at:
- **API**: http://localhost:3001/api
- **Kitchen**: http://localhost:3001/kitchen
- **WebSocket**: ws://localhost:3001/ws

## API Endpoints

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders` | Create order |
| `GET` | `/api/orders` | List orders |
| `GET` | `/api/orders/active` | Active orders |
| `GET` | `/api/orders/:id` | Get order |
| `PATCH` | `/api/orders/:id/status` | Update status |
| `DELETE` | `/api/orders/:id` | Cancel order |

### Menu
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/menu` | Get all items |
| `GET` | `/api/menu/sdk` | SDK format |
| `POST` | `/api/menu` | Add item |
| `PUT` | `/api/menu/:id` | Update item |

### Tables
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tables` | All tables |
| `POST` | `/api/tables/:n/session` | Start session |
| `DELETE` | `/api/tables/:n/session` | End session |
| `GET` | `/api/tables/:n/orders` | Table orders |

## Client SDK Integration

```javascript
// Initialize SDK with server
const desr = new DesrSDK({
    containerId: 'ar-container',
    serverUrl: 'http://localhost:3001'
});

await desr.init();
await desr.connectToServer();

// Load menu from server
await desr.loadMenuFromServer();

// Add items and submit to kitchen
desr.addOrder();
await desr.submitOrderToServer();
```

## WebSocket Events

Connect: `ws://localhost:3001/ws?type=kitchen` or `?type=client&table=5`

Events:
- `new_order` - New order received
- `order_status_changed` - Status updated
- `order_ready` - Order ready for pickup

## Order Statuses

`pending` → `confirmed` → `preparing` → `ready` → `completed`

## Database

Uses SQLite (auto-created at `./data/desr.db`). Schema includes:
- `orders` - Order records
- `menu_items` - Menu with translations
- `tables` - Table sessions

## License

MIT
