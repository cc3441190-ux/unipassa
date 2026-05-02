/**
 * 高德地图 Web服务 API（仅服务端调用，Key 不放前端）
 * Key 控制台需选「Web 服务」，并开通「逆地理编码」「搜索」等 REST 权限。
 */

const AMAP_REST = 'https://restapi.amap.com';

export function getAmapWebKey(): string | null {
  const k =
    process.env.AMAP_WEB_SERVICE_KEY ??
    process.env.AMAP_KEY ??
    process.env.GAODE_WEB_SERVICE_KEY ??
    '';
  const t = k.trim();
  return t.length ? t : null;
}

export function lngLatOrder(lng: number, lat: number): string {
  return `${lng},${lat}`;
}

type AmapAddrComponent = {
  province?: string;
  city?: string | string[];
  district?: string;
  township?: string;
  neighbourhood?: unknown;
  country?: string;
  streetNumber?: { street?: string; number?: string };
};

/** 将高德逆地理结果转成与 OSM/Nominatim 相近的形态，减少对 page.tsx 的改动 */
export function nominatimShapeFromRegeo(amapBody: Record<string, unknown>): {
  display_name: string;
  address: Record<string, string>;
  provider: 'amap';
} {
  if (String(amapBody.status) !== '1') {
    const info = typeof amapBody.info === 'string' ? amapBody.info : 'regeo_failed';
    throw new Error(info);
  }
  const rg = amapBody.regeocode as
    | { formatted_address?: string; addressComponent?: AmapAddrComponent }
    | undefined;
  if (!rg) throw new Error('regeo_empty');

  const ac = rg.addressComponent ?? {};
  let cityRaw = typeof ac.city === 'string' ? ac.city.trim() : '';
  if (!cityRaw && Array.isArray(ac.city) && typeof ac.city[0] === 'string') {
    cityRaw = ac.city[0].trim();
  }
  if (!cityRaw) cityRaw = (typeof ac.province === 'string' ? ac.province : '').trim();

  const district = (typeof ac.district === 'string' ? ac.district : '').trim();
  const township = (typeof ac.township === 'string' ? ac.township : '').trim();
  const province = (typeof ac.province === 'string' ? ac.province : '').trim();

  let neighbourhood = township;
  if (ac.neighbourhood && typeof (ac.neighbourhood as { name?: string }).name === 'string') {
    neighbourhood = (ac.neighbourhood as { name: string }).name;
  }

  const sn = ac.streetNumber ?? {};
  const street = (typeof sn.street === 'string' ? sn.street : '').trim();
  const number = (typeof sn.number === 'string' ? sn.number : '').trim();
  const road = [street, number].filter(Boolean).join('').trim();

  const display_name =
    (typeof rg.formatted_address === 'string' ? rg.formatted_address : '') ||
    [cityRaw || province, district, road].filter(Boolean).join(' · ');

  const address: Record<string, string> = {};
  if (road) address.road = road;
  if (district) {
    address.district = district;
    address.suburb = district;
    address.county = district;
  }
  if (neighbourhood) address.neighbourhood = neighbourhood;
  if (township) address.town = township;
  if (cityRaw) {
    address.city = cityRaw;
    address.city_district = cityRaw;
  }
  if (province) {
    address.state_district = province;
    address.state =
      (typeof ac.country === 'string' ? ac.country : '').trim() || province;
  }

  return { display_name, address, provider: 'amap' };
}

export async function amapReverseGeocode(lng: number, lat: number): Promise<{
  display_name: string;
  address: Record<string, string>;
  provider: 'amap';
}> {
  const key = getAmapWebKey();
  if (!key) throw new Error('amap_key_missing');

  const loc = lngLatOrder(lng, lat);
  const url = new URL(`${AMAP_REST}/v3/geocode/regeo`);
  url.searchParams.set('key', key);
  url.searchParams.set('location', loc);
  url.searchParams.set('extensions', 'all');
  url.searchParams.set('radius', '1200');
  url.searchParams.set('output', 'JSON');

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(10000),
  });
  const data = (await res.json()) as Record<string, unknown>;
  return nominatimShapeFromRegeo(data);
}

function parseAmapLocation(loc: string | undefined): { lat: number; lon: number } | null {
  if (!loc || typeof loc !== 'string') return null;
  const [a, b] = loc.split(',').map((s) => Number(s.trim()));
  if (!Number.isFinite(a) || !Number.isFinite(b)) return null;
  return { lon: a, lat: b };
}

/**
 * 周边 POI（v3 place/around），按距离返回 name + 坐标
 */
export async function amapPlaceAround(options: {
  lng: number;
  lat: number;
  radius: number;
  types?: string;
  keywords?: string;
  /** 每页条数，高德一般最大 50 */
  offset?: number;
}): Promise<Array<{ name: string; lat: number; lon: number }>> {
  const key = getAmapWebKey();
  if (!key) throw new Error('amap_key_missing');

  const {
    lng,
    lat,
    radius,
    types = '',
    keywords = '',
    offset = 30,
  } = options;

  const url = new URL(`${AMAP_REST}/v3/place/around`);
  url.searchParams.set('key', key);
  url.searchParams.set('location', lngLatOrder(lng, lat));
  url.searchParams.set('radius', String(Math.min(Math.max(radius, 50), 50000)));
  url.searchParams.set('sortrule', 'distance');
  url.searchParams.set('page', '1');
  url.searchParams.set('offset', String(Math.min(Math.max(offset, 1), 50)));
  url.searchParams.set('extensions', 'base');
  if (types.trim()) url.searchParams.set('types', types.trim());
  if (keywords.trim()) url.searchParams.set('keywords', keywords.trim());

  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
  });
  const raw = await res.json();
  const status = raw && typeof raw === 'object' && 'status' in raw ? String((raw as { status: unknown }).status) : '0';

  const poisUnknown = raw && typeof raw === 'object' && 'pois' in raw ? (raw as { pois?: unknown }).pois : undefined;
  if (status !== '1' || !Array.isArray(poisUnknown)) {
    return [];
  }

  const out: Array<{ name: string; lat: number; lon: number }> = [];
  for (const row of poisUnknown as Array<Record<string, unknown>>) {
    const name = typeof row.name === 'string' ? row.name.trim() : '';
    if (!name || name.length < 2 || name.length > 80) continue;
    const coords = parseAmapLocation(typeof row.location === 'string' ? row.location : '');
    if (!coords) continue;
    out.push({ name, lat: coords.lat, lon: coords.lon });
  }
  return out;
}

/** 通用周边：餐饮/购物/生活/风景名胜/交通枢纽/公司等（供发布位置选题） —— 类型码见高德 POI 分类 */
export async function amapNearbyForPublish(lng: number, lat: number) {
  return amapPlaceAround({
    lng,
    lat,
    radius: 1100,
    types: '050000|060000|080000|110000|140000|150000|070000|090000|100000|170200|170201|170202|170204|120302',
    offset: 40,
  });
}

/** 公司/产业园区/写字楼等企业向 POI（供引导填写公司附近） */
export async function amapNearbyCompanies(lng: number, lat: number) {
  const first = await amapPlaceAround({
    lng,
    lat,
    radius: 4000,
    types: '170200|170201|170202|170204|120302|120303|120305|170207',
    offset: 50,
  });
  if (first.length >= 6) return first;
  const second = await amapPlaceAround({
    lng,
    lat,
    radius: 5500,
    keywords: '科技园|产业园|写字楼|大厦',
    offset: 50,
  });
  const seen = new Set<string>();
  const merge: typeof first = [];
  for (const p of [...first, ...second]) {
    const k = p.name.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    merge.push(p);
    if (merge.length >= 16) break;
  }
  return merge;
}
