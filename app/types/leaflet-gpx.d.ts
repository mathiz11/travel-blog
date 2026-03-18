declare module 'leaflet-gpx' {
  import type { Map, LayerGroup, LatLngBounds } from 'leaflet'

  interface GPXOptions {
    async?: boolean
    marker_options?: Record<string, unknown>
    polyline_options?: Record<string, unknown>
  }

  class GPX extends LayerGroup {
    constructor(gpx: string, options?: GPXOptions)
    getBounds(): LatLngBounds
    on(event: 'loaded', handler: (e: { target: GPX }) => void): this
    on(event: string, handler: (e: unknown) => void): this
    addTo(map: Map): this
  }

  export { GPX }
}
