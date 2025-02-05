# Tic Tac Toe Web App

This is a full-stack Tic Tac Toe web application built using modern web technologies.

---

## Features

- Multiplayer Tic Tac Toe game with real-time updates using **Socket.io**.
- Players can:
  - **Create rooms** to host games.
  - **Join rooms** using a unique room code for multiplayer gameplay.
- Modern development practices leveraging TypeScript + Socket.io for real-time communication.
- Clean UI for seamless gameplay on various devices.

---

## Tech Stack

### Backend:

- **Node.js**: JavaScript runtime for building fast and scalable server-side applications.
- **Express.js**: Web framework for creating RESTful APIs and handling server-side logic.
- **Socket.io**: Real-time communication for multiplayer functionality.
- **TypeScript**: Strongly-typed language for improved code quality and maintainability.
- **PostgreSQL**: Relational database for storing game data.
- **TypeORM**: Powerful Object-Relational Mapper (ORM) for managing database interactions with ease and type safety.

### Frontend:

- **React**: Library for building user interfaces.
- **TypeScript**: Ensures type safety and scalability in the frontend code.
- **Vite**: Modern build tool for fast development and optimized production builds.
- **Tailwind CSS**: Utility-first CSS framework for responsive and modern styling.
- **Zod**: Schema validation library for ensuring data integrity and type safety.
- **Zustand**: Lightweight state management library for managing application state with ease.

---

## Prerequisites

- **Node.js** (v18 or newer)
- **npm** or **yarn**
- **PostgreSQL** (with a running instance)
- Modern web browser (e.g. Chrome)

---

## Installation

### Backend Setup

1. Clone the repository:

   ```bash
   https://github.com/austinL394/Tic-Tac-Toe-Web-App.git
   cd tic-tac-toe-webapp/backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory and configure the following environment variables:

   ```env
   # Server configuration
   PORT=5000
   JWT_SECRET=your_jwt_secret_key

   # Database configuration
   DB_HOST=your_database_host
   DB_PORT=your_database_port
   DB_USERNAME=your_database_username
   DB_PASSWORD=your_database_password
   DB_DATABASE=your_database_name

   # Environment
   NODE_ENV=development
   ```

4. Run database migrations to set up the database schema:

   ```bash
   npm run typeorm migration:run
   ```

5. Start the backend server:

   ```bash
   npm start
   ```

6. The server will start running on the specified `PORT` (default: `5000`). You can now use the API and WebSocket features for the Tic Tac Toe web app.

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the app in your browser at `http://localhost:5173`.

### Running Integration tests

1. To run integration tests for the game feature:

   ```bash
   npx jest game
   ```

2. To run integration tests for the user authentication:
   ```bash
   npx jest user
   ```

## Backend Service Development Guide

### Creating New Services

#### 1. Base Service Extension

All new services should extend the `BaseService` class:

```typescript
import { BaseService } from "./baseService";

export class NewFeatureService extends BaseService {
  constructor(io: SocketIOServer) {
    super(io, "newFeatureService");
  }
}
```

#### 2. Service Structure Pattern

```typescript
export class NewFeatureService extends BaseService {
  // 1. Constructor
  constructor(io: SocketIOServer) {
    super(io, "newFeatureService");
  }

  // 2. Event Setup Method
  setupEvents(socket: Socket) {
    const userId = socket.data.userId;

    socket.on("feature:action", (data) =>
      this.handleAction(socket, userId, data)
    );
    // Add more event listeners here
  }

  // 3. Event Handlers (Private Methods)
  private handleAction(socket: Socket, userId: string, data: any) {
    try {
      // Validation
      const user = this.store.getUser(userId);
      if (!user) {
        socket.emit("feature:error", "User not found");
        return;
      }

      // Business Logic
      // ...

      // State Updates
      this.store.updateUser(userId, {
        /* updates */
      });

      // Event Emissions
      socket.emit("feature:success" /* response data */);
    } catch (error) {
      this.error("Error handling action:", error);
      socket.emit("feature:error", "Failed to process action");
    }
  }

  // 4. Helper Methods
  private helperMethod() {
    // Internal helper logic
  }
}
```

#### 3. Event Naming Convention

Follow the pattern: feature:action

```typescript
// Examples:
"chat:send_message";
"profile:update";
"game:make_move";
```

#### 4. State Management

Add new state types to the shared store:

```typescript
// In SharedStore
interface NewFeatureState {
  // Define state structure
}

export class SharedStore {
  private newFeatureState: Map<string, NewFeatureState> = new Map();

  // Add CRUD methods
  setNewFeatureState(id: string, state: NewFeatureState) {
    this.newFeatureState.set(id, state);
  }
}
```

## Frontend Service Development Guide

### 1. Adding a New Service

To add a new service (e.g., ChatSocketService), follow these steps:

#### 1.1 Create a New Service

Create a new file `/services/socket/chatSocketService.ts`:

```typescript
import { Socket } from "socket.io-client";
import { BaseSocketService } from "./baseSocketService";

export class ChatSocketService extends BaseSocketService {
  constructor(socket: Socket) {
    super(socket);
  }

  // Add your methods here
  sendMessage(roomId: string, message: string) {
    this.socket.emit("chat:send_message", { roomId, message });
  }
}
```

#### 1.2 Update MainSocketService

Modify `mainSocketService.ts` to include your new service:

```typescript
import { ChatSocketService } from "./chatSocketService";

export class MainSocketService {
  private socket: Socket;
  public user: UserSocketService;
  public game: GameSocketService;
  public chat: ChatSocketService; // Add new service

  constructor(socket: Socket) {
    this.socket = socket;
    this.user = new UserSocketService(socket);
    this.game = new GameSocketService(socket);
    this.chat = new ChatSocketService(socket); // Initialize new service
  }
}
```

### 2. Adding Event Handlers

#### 2.1 Create Event Handler File

Create `services/socket/eventschatEvents.ts`:

```typescript
import { Socket } from "socket.io-client";
import { SocketEventHandlers } from "@/types";

export const setupChatEvents = (
  socket: Socket,
  { setMessages, toast }: SocketEventHandlers
) => {
  socket.on("chat:message_received", (message) => {
    setMessages((prev) => [...prev, message]);
    toast.showInfo(`New message from ${message.sender}`);
  });

  // Cleanup function
  return () => {
    socket.off("chat:message_received");
  };
};
```

#### 2.2 Update SocketProvider

Add the new events to `SocketProvider.tsx`:

```typescript
// Import new events
import { setupChatEvents } from "@/services/socket/events/chatEvents";

// Inside connect function
const cleanupChatEvents = setupChatEvents(socket, handlers);

// Add to cleanup
return () => {
  cleanupUserEvents();
  cleanupGameEvents();
  cleanupChatEvents();
  // ... rest of cleanup
};
```
