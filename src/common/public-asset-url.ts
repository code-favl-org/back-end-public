export function publicAssetUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  const publicUrl = process.env.URL_PUBLIC;
  if (!publicUrl) {
    throw new Error('Missing required environment variable: URL_PUBLIC');
  }

  let pathname: string;
  let search = '';
  let hash = '';

  try {
    const publicOrigin = new URL(publicUrl).origin;
    const parsed = new URL(value, publicOrigin);
    pathname = parsed.pathname;
    search = parsed.search;
    hash = parsed.hash;

    const uploadIndex = pathname.indexOf('/upload/');
    const legacyIndex = pathname.indexOf('/public/upload/');
    const index = legacyIndex >= 0 ? legacyIndex + '/public'.length : uploadIndex;
    if (index < 0) return value;

    return `${publicOrigin}${pathname.slice(index)}${search}${hash}`;
  } catch {
    return value;
  }
}
