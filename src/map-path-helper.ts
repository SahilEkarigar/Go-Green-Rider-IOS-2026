// map-path-helper.ts

export class MapPathHelper {

  private map: google.maps.Map;
  private apiKey: string;
  private polyline?: google.maps.Polyline;
  private debounceTimer: any = null;

  constructor(map: google.maps.Map, roadsApiKey: string) {
    this.map = map;
    this.apiKey = roadsApiKey;
  }

  // ---------------------------
  // PUBLIC: Call this to update the path
  // ---------------------------
  updatePath(lat: number, lng: number) {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.drawPath(lat, lng);
    }, 500);
  }

  // ---------------------------
  // PUBLIC: Clear existing path
  // ---------------------------
  clear() {
    if (this.polyline) {
      this.polyline.setMap(null);
      this.polyline = undefined;
    }
  }

  // ---------------------------
  // INTERNAL: Draw the dashed path
  // ---------------------------
  private async drawPath(lat: number, lng: number) {
    const snapped = await this.getNearestRoadPoint(lat, lng);
    if (!snapped) return;

    this.clear();

    this.polyline = new google.maps.Polyline({
      path: [
        { lat, lng },
        snapped
      ],
      strokeOpacity: 0,
      icons: [{
        icon: { path: "M 0,-1 0,1", scale: 4, strokeOpacity: 1 },
        offset: "0",
        repeat: "10px"
      }],
      zIndex: 3000,
      map: this.map
    });
  }

  // ---------------------------
  // INTERNAL: Roads API call
  // ---------------------------
  private async getNearestRoadPoint(lat: number, lng: number):
    Promise<google.maps.LatLngLiteral | null> {

    const url = `https://roads.googleapis.com/v1/snapToRoads?path=${lat},${lng}&interpolate=false&key=${this.apiKey}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.snappedPoints?.length) {
        const p = data.snappedPoints[0].location;
        return { lat: p.latitude, lng: p.longitude };
      }
      return null;
    } catch (e) {
      console.warn("Roads API error:", e);
      return null;
    }
  }

}
