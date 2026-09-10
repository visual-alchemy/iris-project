import { Stream } from "@/components/dashboard/stream-preview"
import { toast } from "sonner"

// ---- Public API response shapes ----

export interface StreamKey {
  id: string
  name: string
  keyString: string
  key: string
  status: string
  ipWhitelist: string[]
  createdAt: string
  lastUsed: string
  currentStream: boolean
}

export interface User {
  id: string
  username: string
  createdAt: string
}

export interface Destination {
  id: string
  name: string
  platform: string
  url: string
  status: string
  stream_key_id: number | string | null
}

export interface DashboardStats {
  streams: { total: number }
  keys: { total: number; active: number }
  destinations: { total: number; streaming: number; idle: number }
  viewers: { formatted: string }
  users?: { total: number }
}

export interface StreamKeyResponse {
  id: number
  name: string
  key: string
  status: string
}

export interface RegenerateStreamKeyResponse {
  key: string
  status: string
}

export interface CreateUserResponse {
  data: {
    id: number
    username: string
    inserted_at: string | null
  }
}

export interface LoginResponse {
  token: string
  user: { id: string; username: string }
}

// ---- Raw backend payloads ----

interface RawStream {
  id: number
  title?: string
  streamKey?: string
  bitrate?: string
  viewers?: number
  uptime?: string
  destinationsCount?: number
  ready_time?: string | null
}

interface RawWhitelist {
  ip_address: string
}

interface RawStreamKey {
  id: number
  name: string
  key: string
  status: string
  whitelists?: RawWhitelist[]
  inserted_at?: string
  last_used_at?: string
  is_live?: boolean
}

interface RawUser {
  id: number
  username: string
  inserted_at?: string
}

interface RawDestination {
  id: number
  name: string
  platform: string
  url: string
  status: string
  stream_key_id: number | null
}

function getApiUrl() {
  const isServer = typeof window === 'undefined';
  if (isServer) {
    const backendUrl = process.env.BACKEND_API_URL || 'http://iris_api:4000';
    return `${backendUrl}/api`;
  }
  return '/api';
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('iris_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

async function apiFetch(url: string, options: RequestInit = {}) {
  const headers = {
    ...getAuthHeaders(),
    ...options.headers,
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('iris_token');
      localStorage.removeItem('iris_user');
      window.location.href = '/login';
    }
  }

  return res;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${getApiUrl()}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    throw new Error("Invalid username or password");
  }

  return await res.json();
}

export async function getStreams(): Promise<Stream[]> {
  try {
    const res = await apiFetch(`${getApiUrl()}/streams`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data: RawStream[] = await res.json();
    return data.map((item) => ({
      id: item.id.toString(),
      name: item.title || "Live Stream",
      streamKey: item.streamKey ?? "",
      status: "live",
      bitrate: item.bitrate || "0 kbps",
      viewers: item.viewers || 0,
      duration: item.uptime || "00:00:00",
      targets: item.destinationsCount || 0,
      readyTime: item.ready_time || null,
    }));
  } catch (err) {
    console.error("Failed to fetch streams:", err);
    return [];
  }
}

export async function getStreamKeys(): Promise<StreamKey[]> {
  try {
    const res = await apiFetch(`${getApiUrl()}/stream-keys`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data: RawStreamKey[] = await res.json();
    return data.map((item) => ({
      id: item.id.toString(),
      name: item.name,
      keyString: item.key, // UI expects keyString
      key: item.key,
      status: item.status,
      ipWhitelist: item.whitelists ? item.whitelists.map((w) => w.ip_address) : [],
      createdAt: item.inserted_at || "Just now",
      lastUsed: item.last_used_at || "Never",
      currentStream: item.is_live || false
    }));
  } catch (err) {
    console.error("Failed to fetch stream keys:", err);
    return [];
  }
}

export async function createStreamKey(name: string, active: boolean): Promise<StreamKeyResponse> {
  try {
    const res = await apiFetch(`${getApiUrl()}/stream-keys`, {
      method: 'POST',
      body: JSON.stringify({
        stream_key: {
          name: name,
          status: active ? 'active' : 'inactive'
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      toast.error(`Backend Error (${res.status}): ${errText}`);
      throw new Error("Failed to create stream key");
    }
    return await res.json();
  } catch (err) {
    toast.error(`Network Error: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

export async function deleteStreamKey(id: string | number) {
  const res = await apiFetch(`${getApiUrl()}/stream-keys/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete stream key");
  }
  return true;
}

export async function regenerateStreamKey(id: string | number): Promise<RegenerateStreamKeyResponse> {
  const res = await apiFetch(`${getApiUrl()}/stream-keys/${id}/regenerate`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error("Failed to regenerate stream key");
  }
  return await res.json();
}

export async function getUsers(): Promise<User[]> {
  try {
    const res = await apiFetch(`${getApiUrl()}/users`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data: { data: RawUser[] } = await res.json();
    return data.data.map((item) => ({
      id: item.id.toString(),
      username: item.username,
      createdAt: item.inserted_at || "Just now",
    }));
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return [];
  }
}

export async function createUser(username: string, passwordString: string): Promise<CreateUserResponse> {
  try {
    const res = await apiFetch(`${getApiUrl()}/users`, {
      method: 'POST',
      body: JSON.stringify({
        user: {
          username: username,
          password: passwordString
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      toast.error(`Backend Error (${res.status}): ${errText}`);
      throw new Error("Failed to create user");
    }
    return await res.json();
  } catch (err) {
    toast.error(`Network Error: ${err instanceof Error ? err.message : String(err)}`);
    throw err;
  }
}

export async function deleteUser(id: string | number) {
  const res = await apiFetch(`${getApiUrl()}/users/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete user");
  }
  return true;
}

export async function deleteDestination(id: string | number) {
  const res = await apiFetch(`${getApiUrl()}/destinations/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete destination");
  }
  return true;
}

export async function createDestination(name: string, platform: string, url: string, streamKeyId: string | number): Promise<unknown> {
  const res = await apiFetch(`${getApiUrl()}/destinations`, {
    method: 'POST',
    body: JSON.stringify({
      name: name,
      platform: platform,
      target_rtmp_url: url,
      status: 'stopped',
      stream_key_id: typeof streamKeyId === 'string' ? parseInt(streamKeyId, 10) : streamKeyId
    })
  });

  if (!res.ok) {
    throw new Error("Failed to create destination");
  }
  return await res.json();
}

export async function updateDestination(id: string | number, name: string, platform: string, url: string, streamKeyId: string | number): Promise<unknown> {
  const res = await apiFetch(`${getApiUrl()}/destinations/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      name: name,
      platform: platform,
      target_rtmp_url: url,
      stream_key_id: typeof streamKeyId === 'string' ? parseInt(streamKeyId, 10) : streamKeyId
    })
  });

  if (!res.ok) {
    throw new Error("Failed to update destination");
  }
  return await res.json();
}

export async function startDestination(id: string | number): Promise<unknown> {
  const res = await apiFetch(`${getApiUrl()}/destinations/${id}/start`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error("Failed to start destination");
  }
  return await res.json();
}

export async function stopDestination(id: string | number): Promise<unknown> {
  const res = await apiFetch(`${getApiUrl()}/destinations/${id}/stop`, {
    method: 'POST'
  });
  if (!res.ok) {
    throw new Error("Failed to stop destination");
  }
  return await res.json();
}

export async function getDestinations(): Promise<Destination[]> {
  try {
    const res = await apiFetch(`${getApiUrl()}/destinations`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data: RawDestination[] = await res.json();
    return data.map((item) => ({
      ...item,
      id: item.id.toString(),
    }));
  } catch (err) {
    console.error("Failed to fetch destinations:", err);
    return [];
  }
}

export async function getServerStats() {
  try {
    const res = await apiFetch(`${getApiUrl()}/server-stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { version: "Unknown", uptime: "0:00:00", connections: 0 };
  }
}

export async function getDatabaseStats() {
  try {
    const res = await apiFetch(`${getApiUrl()}/database-stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch {
    return { records: 0, size: "Unknown", lastBackup: "Unknown" }
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [streams, streamKeys, destinations] = await Promise.all([
    getStreams(),
    getStreamKeys(),
    getDestinations()
  ]);

  const activeStreams = streams.length;
  const activeKeys = streamKeys.filter((k) => k.status === 'active').length;

  const totalDestinations = destinations.length;
  const streamingDestinations = destinations.filter((d) => d.status === 'streaming').length;

  const totalViewers = streams.reduce((sum, stream) => sum + (stream.viewers || 0), 0);

  const formatViewers = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return {
    streams: {
      total: activeStreams,
    },
    keys: {
      total: streamKeys.length,
      active: activeKeys,
    },
    destinations: {
      total: totalDestinations,
      streaming: streamingDestinations,
      idle: totalDestinations - streamingDestinations,
    },
    viewers: {
      formatted: formatViewers(totalViewers),
    }
  };
}
