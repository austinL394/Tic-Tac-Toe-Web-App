import { Server as SocketIOServer } from "socket.io";
import { SharedStore } from "../store/sharedStore";

/**
 * Base service class for creating socket-based services
 *
 * @description
 * - Provides common logging and store management functionality
 * - Serves as an abstract base for specific service implementations
 * - Manages Socket.IO server and shared application state
 */
export abstract class BaseService {
  /** Socket.IO server instance */
  protected io: SocketIOServer;

  /** Shared application state store */
  protected store: SharedStore;
  protected serviceName: string;

  constructor(io: SocketIOServer, serviceName: string) {
    this.io = io;
    this.store = SharedStore.getInstance();
    this.serviceName = serviceName;
  }

  /**
   * Logs informational messages with service context
   *
   * @param message - Primary log message
   * @param args - Optional additional log arguments
   *
   * @description
   * - Prefixes log message with service name
   * - Supports additional log arguments
   */
  protected log(message: string, ...args: any[]) {
    console.log(`[${this.serviceName}] ${message}`, ...args);
  }

  /**
   * Logs error messages with service context
   *
   * @param message - Error message
   * @param args - Optional additional error details
   *
   * @description
   * - Prefixes error message with service name
   * - Supports additional error logging arguments
   */
  protected error(message: string, ...args: any[]) {
    console.error(`[${this.serviceName}] Error: ${message}`, ...args);
  }
}
