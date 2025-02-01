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
