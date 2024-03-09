export function getUrlParam(param, fallback = null) {
  const href = window.location.href.replace("#", "?");
  const url = new URL(href);
  return url.searchParams.get(param) || fallback;
}
