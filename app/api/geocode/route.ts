import { NextRequest, NextResponse } from 'next/server';
import { amapReverseGeocode, getAmapWebKey } from '@/lib/amap';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!lat || !lon) {
    return NextResponse.json({ error: '缺少坐标参数' }, { status: 400 });
  }

  const latN = Number(lat);
  const lonN = Number(lon);
  if (!Number.isFinite(latN) || !Number.isFinite(lonN)) {
    return NextResponse.json({ error: '坐标格式无效' }, { status: 400 });
  }

  if (getAmapWebKey()) {
    try {
      const { display_name, address, provider } = await amapReverseGeocode(lonN, latN);
      return NextResponse.json({
        display_name,
        address,
        _provider: provider,
      });
    } catch (e) {
      console.warn('高德逆地理解析失败，回退 OSM：', e);
    }
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latN}&lon=${lonN}&accept-language=zh-CN`,
      {
        headers: { 'User-Agent': 'UniPass-App/1.0 (contact@unipass.app)' },
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) {
      return NextResponse.json({ error: `Nominatim error ${res.status}` }, { status: 502 });
    }
    const data = await res.json();
    return NextResponse.json({ ...data, _provider: 'nominatim' });
  } catch (e) {
    console.error('Geocode error:', e);
    return NextResponse.json({ error: '定位解析失败' }, { status: 500 });
  }
}
