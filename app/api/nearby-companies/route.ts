import { NextRequest, NextResponse } from 'next/server';

import { amapNearbyCompanies, getAmapWebKey } from '@/lib/amap';



type OverpassElement = {

  tags?: Record<string, string>;

};



function cleanCompanyName(name: string): string {

  return name

    .replace(/\s+/g, ' ')

    .replace(/[()（）]/g, '')

    .trim();

}



async function overpassCompanies(lat: number, lon: number) {

  const radius = 3000;

  const query = `

[out:json][timeout:15];

(

  node["name"]["office"](around:${radius},${lat},${lon});

  way["name"]["office"](around:${radius},${lat},${lon});

  relation["name"]["office"](around:${radius},${lat},${lon});

  node["name"]["company"](around:${radius},${lat},${lon});

  way["name"]["company"](around:${radius},${lat},${lon});

  relation["name"]["company"](around:${radius},${lat},${lon});

);

out tags 60;

`;



  try {

    const res = await fetch('https://overpass-api.de/api/interpreter', {

      method: 'POST',

      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },

      body: query,

      signal: AbortSignal.timeout(12000),

    });

    if (!res.ok) {

      return [] as string[];

    }

    const data = (await res.json()) as { elements?: OverpassElement[] };

    const rawNames = (data.elements ?? [])

      .map((el) => cleanCompanyName(el.tags?.name ?? ''))

      .filter(Boolean);

    const companies = Array.from(new Set(rawNames))

      .filter((name) => name.length >= 2 && name.length <= 40)

      .slice(0, 12);

    return companies;

  } catch {

    return [];

  }

}



export async function GET(req: NextRequest) {

  const { searchParams } = new URL(req.url);

  const lat = Number(searchParams.get('lat'));

  const lon = Number(searchParams.get('lon'));



  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {

    return NextResponse.json({ error: '缺少有效坐标参数' }, { status: 400 });

  }



  if (getAmapWebKey()) {

    try {

      const rows = await amapNearbyCompanies(lon, lat);

      const companies = Array.from(

        new Set(rows.map((r) => cleanCompanyName(r.name)).filter((n) => n.length >= 2 && n.length <= 48))

      ).slice(0, 14);

      return NextResponse.json({ companies, _provider: 'amap' as const });

    } catch (e) {

      console.warn('高德企业周边失败，回退 Overpass：', e);

    }

  }



  const companies = await overpassCompanies(lat, lon);

  return NextResponse.json({ companies, _provider: 'overpass' as const });

}


