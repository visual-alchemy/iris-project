import { Stream } from "@/components/dashboard/stream-preview"

function getApiUrl() {
  const isServer = typeof window === 'undefined';
  if (isServer) return 'http://iris_api:4000/api';
  return '/api';
}

export async function login(username: string, password: string) {
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
    const res = await fetch(`${getApiUrl()}/streams`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.title || "Live Stream",
      streamKey: item.streamKey,
      status: "live",
      bitrate: item.bitrate || "0 kbps",
      viewers: 0,
      duration: item.uptime || "00:00:00",
      targets: item.destinationsCount || 0,
      readyTime: item.ready_time || null,
    }));
  } catch (err) {
    console.error("Failed to fetch streams:", err);
    return [];
  }
}

export async function getStreamKeys() {
  try {
    const res = await fetch(`${getApiUrl()}/stream-keys`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      keyString: item.key, // UI expects keyString
      key: item.key,
      status: item.status,
      ipWhitelist: item.whitelists ? item.whitelists.map((w: any) => w.ip_address) : [],
      createdAt: item.inserted_at || "Just now",
      lastUsed: item.last_used_at || "Never",
      currentStream: item.is_live || false
    }));
  } catch (err) {
    console.error("Failed to fetch stream keys:", err);
    return [];
  }
}

export async function createStreamKey(name: string, active: boolean) {
  try {
    const res = await fetch(`${getApiUrl()}/stream-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stream_key: {
          name: name,
          status: active ? 'active' : 'inactive'
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      alert(`Backend Error (${res.status}): ${errText}`);
      throw new Error("Failed to create stream key");
    }
    return await res.json();
  } catch (err: any) {
    alert(`Network Error: ${err.message}`);
    throw err;
  }
}

export async function deleteStreamKey(id: string | number) {
  const res = await fetch(`${getApiUrl()}/stream-keys/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete stream key");
  }
  return true;
}

export async function regenerateStreamKey(id: string | number) {
  // Generate a new key string by deleting and recreating
  // Since the backend doesn't have a dedicated regenerate endpoint,
  // we'll call a PATCH/PUT if available, or just return the new key
  const res = await fetch(`${getApiUrl()}/stream-keys/${id}/regenerate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error("Failed to regenerate stream key");
  }
  return await res.json();
}

export async function createUser(username: string, passwordString: string) {
  try {
    const res = await fetch(`${getApiUrl()}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          username: username,
          password: passwordString
        }
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      alert(`Backend Error (${res.status}): ${errText}`);
      throw new Error("Failed to create user");
    }
    return await res.json();
  } catch (err: any) {
    alert(`Network Error: ${err.message}`);
    throw err;
  }
}

export async function deleteUser(id: string | number) {
  const res = await fetch(`${getApiUrl()}/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete user");
  }
  return true;
}

export async function deleteDestination(id: string | number) {
  const res = await fetch(`${getApiUrl()}/destinations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error("Failed to delete destination");
  }
  return true;
}

export async function getDestinations() {
  try {
    const res = await fetch(`${getApiUrl()}/destinations`, { cache: 'no-store' });
    if (!res.ok) return [];

    const data = await res.json();
    return data.map((item: any) => ({
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
    const res = await fetch(`${getApiUrl()}/server-stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch (err) {
    return { version: "Unknown", uptime: "0:00:00", connections: 0 };
  }
}

export async function getDatabaseStats() {
  try {
    const res = await fetch(`${getApiUrl()}/database-stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed");
    return await res.json();
  } catch (err) {
    return { records: 0, size: "Unknown", lastBackup: "Unknown" }
  }
}

export async function getDashboardStats() {
  const [streams, streamKeys, destinations] = await Promise.all([
    getStreams(),
    getStreamKeys(),
    getDestinations()
  ]);

  const activeStreams = streams.length;
  const activeKeys = streamKeys.filter((k: any) => k.status === 'active').length;

  const totalDestinations = destinations.length;
  const streamingDestinations = destinations.filter((d: any) => d.status === 'streaming').length;

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
