# Chat Service - Online Users Functionality

## Overview
The chat service now includes real-time tracking of online users, showing who is currently active in the chat.

## Features Added

### 1. Real-time Online Users Tracking
- Tracks users when they connect/disconnect via WebSocket
- Shows online status in real-time
- Maintains last seen timestamps

### 2. New Socket Events

#### Client → Server Events:
- `chatMessage` - Send a chat message
- `typing` - Indicate when user is typing
- `heartbeat` - Keep user status active

#### Server → Client Events:
- `onlineUsers` - List of all online users
- `userJoined` - Notification when user joins
- `userLeft` - Notification when user leaves
- `chatMessage` - New chat message
- `userTyping` - User typing indicator

### 3. New HTTP API Endpoints

#### GET `/chat/online-users`
Returns currently online users:
```json
{
  "users": [
    {
      "userId": "123",
      "username": "john_doe",
      "email": "john@example.com",
      "lastSeen": "2025-08-19T18:00:00.000Z"
    }
  ],
  "count": 1,
  "timestamp": "2025-08-19T18:00:00.000Z"
}
```

#### GET `/chat/users`
Returns online users with additional metadata:
```json
{
  "users": [
    {
      "userId": "123",
      "username": "john_doe",
      "email": "john@example.com",
      "isOnline": true,
      "lastSeen": "2025-08-19T18:00:00.000Z"
    }
  ],
  "total": 1,
  "online": 1,
  "timestamp": "2025-08-19T18:00:00.000Z",
  "note": "Only showing currently online users. For all registered users, use the auth service."
}
```

## How It Works

### 1. User Connection
When a user connects via WebSocket:
1. JWT token is verified
2. User is added to online users list
3. `onlineUsers` event is emitted to all clients
4. `userJoined` event is emitted to all clients

### 2. User Activity
- Users can send `heartbeat` events to keep status active
- Typing indicators are broadcast to other users
- Last seen timestamps are updated

### 3. User Disconnection
When a user disconnects:
1. User is removed from online users list
2. `userLeft` event is emitted to all clients
3. Updated `onlineUsers` event is emitted

## Testing

### 1. Start the Services
```bash
# Terminal 1 - Auth Service
cd backend/auth-services
npm start

# Terminal 2 - Chat Service
cd backend/chat-service
npm start
```

### 2. Test with HTML Client
Open `test-chat-online-users.html` in multiple browser tabs to see:
- Real-time online users list
- User join/leave notifications
- Chat messages
- Online status updates

### 3. Test API Endpoints
```bash
# Test online users endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/chat/online-users

# Test users endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/chat/users
```

## Frontend Integration

### 1. Connect to Chat Service
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### 2. Listen for Online Users
```javascript
socket.on('onlineUsers', (data) => {
  console.log('Online users:', data.users);
  console.log('Total online:', data.count);
});
```

### 3. Handle User Events
```javascript
socket.on('userJoined', (user) => {
  console.log(`${user.username} joined the chat`);
});

socket.on('userLeft', (user) => {
  console.log(`${user.username} left the chat`);
});
```

### 4. Send Activity Updates
```javascript
// Keep user status active
setInterval(() => {
  socket.emit('heartbeat');
}, 30000); // Every 30 seconds

// Send typing indicator
socket.emit('typing', true);
// Stop typing indicator
socket.emit('typing', false);
```

## Security Notes

- All endpoints require valid JWT tokens
- Users can only see other online users
- No sensitive user information is exposed
- WebSocket connections are authenticated

## Performance Considerations

- Online users are stored in memory (not persistent)
- Heartbeat events help maintain accurate online status
- Real-time updates are efficient with Socket.IO
- API endpoints provide fallback for non-WebSocket clients
