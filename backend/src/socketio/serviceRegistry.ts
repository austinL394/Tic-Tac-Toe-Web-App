/**
 * ServiceRegistry: A Singleton class for managing service dependencies
 *
 * Key Features:
 * - Singleton pattern for global service management
 * - Dynamic service registration and retrieval
 * - Type-safe service access
 *
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  register(serviceName: string, service: any) {
    this.services.set(serviceName, service);
  }

  get<T>(serviceName: string): T {
    return this.services.get(serviceName) as T;
  }
}
