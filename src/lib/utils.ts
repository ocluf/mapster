import type { LngLat } from 'maplibre-gl';

export function latLngToContainerPoint(
	map: import('maplibre-gl').Map,
	latLng: { lat: number; lng: number }
) {
	return map.project(latLng);
}

export function getMousePositionAsLnglat(
	map: import('maplibre-gl').Map,
	mousePosition: { x: number; y: number }
) {
	const Lnglat: LngLat = map.unproject([mousePosition.x, mousePosition.y]);
	return Lnglat;
}

export function hasTouch() {
	return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
