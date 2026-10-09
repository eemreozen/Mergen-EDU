// Örnek bağlantı katmanı. Frontend tasarımından ve görsel koordinatlardan bağımsızdır.
import type { ExportBundle, MapView, DiscoveryView } from './mergen-v1';

export class MergenClient {
  constructor(private readonly baseUrl: string, private readonly sessionId: string) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}/api/v1${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', 'X-Demo-Session': this.sessionId, ...init?.headers },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(`${payload.error.code}: ${payload.error.message}`);
    return payload as T;
  }

  exportProject(projectId: string) {
    return this.request<ExportBundle>(`/projects/${projectId}/export`);
  }

  discovery(projectId: string) {
    return this.request<DiscoveryView>(`/projects/${projectId}/discovery`);
  }

  generateRoadmap(projectId: string) {
    return this.request<MapView>(`/projects/${projectId}/roadmap/generate`, { method: 'POST' });
  }
}
