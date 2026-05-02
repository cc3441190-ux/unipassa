import { NextRequest, NextResponse } from 'next/server';

import { amapNearbyForPublish, getAmapWebKey } from '@/lib/amap';



type OverpassEl = {

  type: string;

  lat?: number;

  lon?: number;

  center?: { lat: number; lon: number };

  tags?: Record<string, string>;

};



function coordFrom(el: OverpassEl): { lat: number; lon: number } | null {

  if (typeof el.lat === 'number' && typeof el.lon === 'number') {

    return { lat: el.lat, lon: el.lon };

  }

  if (el.center && typeof el.center.lat === 'number' && typeof el.center.lon === 'number') {

    return { lat: el.center.lat, lon: el.center.lon };

  }

  return null;

}



function cleanPlaceName(raw: string): string {

  return raw.replace(/\s+/g, ' ').trim();

}



async function overpassNearby(lat: number, lon: number) {

  const radius = 900;

  const query = `

[out:json][timeout:14];

(

  node["amenity"]["name"](around:${radius},${lat},${lon});

  way["amenity"]["name"](around:${radius},${lat},${lon});

  node["shop"]["name"](around:${radius},${lat},${lon});

  node["railway"="station"]["name"](around:${Math.round(radius * 1.8)},${lat},${lon});

  way["railway"="station"]["name"](around:${Math.round(radius * 1.8)},${lat},${lon});

);

out center 52;

`;



  try {

    const res = await fetch('https://overpass-api.de/api/interpreter', {

      method: 'POST',

      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },

      body: query,

      signal: AbortSignal.timeout(12000),

    });

    if (!res.ok) {

      return [] as Array<{ name: string; lat: number; lon: number }>;

    }

    const data = (await res.json()) as { elements?: OverpassEl[] };

    const out: Array<{ name: string; lat: number; lon: number }> = [];

    const seen = new Set<string>();



    for (const el of data.elements ?? []) {

      const name = cleanPlaceName(el.tags?.name ?? '');

      if (!name || name.length < 2 || name.length > 48) continue;

      const coord = coordFrom(el);

      if (!coord) continue;

      const key = name.toLowerCase();

      if (seen.has(key)) continue;

      seen.add(key);

      out.push({ name, lat: coord.lat, lon: coord.lon });

      if (out.length >= 18) break;

    }

    return out;

  } catch {

    return [];

  }

}



/** 高德周边 POI 为主；未配置 Key 或失败则用 OSM Overpass */

export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get('lat'));

  const lon = Number(searchParams.get('lon'));



  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {

    return NextResponse.json({ error: '缺少有效坐标参数' }, { status: 400 });

  }



  if (getAmapWebKey()) {

    try {

      const rows = await amapNearbyForPublish(lon, lat);

      const seen = new Set<string>();

      const places = rows

        .filter((p) => {

          const key = p.name.toLowerCase();

          if (seen.has(key)) return false;

          seen.add(key);

          return true;

        })

        .slice(0, 20)

        .map(({ name, lat: la, lon: ln }) => ({ name, lat: la, lon: ln }));



      return NextResponse.json({ places, _provider: 'amap' as const });

    } catch (e) {

      console.warn('高德周边 POI 失败，回退 Overpass：', e);

    }

  }



  const places = await overpassNearby(lat, lon);

  return NextResponse.json({ places, _provider: 'overpass' as const });

}


