import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { Location } from '../types';

interface MapProps {
  onLocationSelect: (location: Location) => void;
  center: Location;
  zoom: number;
  selectedLocation: Location | null;
  route: { start: Location; end: Location } | null;
  routePolyline: Location[] | null;
}

const MapComponent: React.FC<MapProps> = ({ onLocationSelect, center, zoom, selectedLocation, route, routePolyline }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const routeLayerRef = useRef<L.FeatureGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom: zoom,
      });
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      map.on('click', (e) => {
        onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Control map view for center and zoom, but not if a route is active (fitBounds handles it)
  useEffect(() => {
    if (mapRef.current && !route) {
      mapRef.current.flyTo([center.lat, center.lng], zoom);
    }
  }, [center, zoom, route]);

  // Control single selected marker
  useEffect(() => {
    if (mapRef.current) {
      // Clear any existing route layer when a new single location is selected
      if (routeLayerRef.current) {
          mapRef.current.removeLayer(routeLayerRef.current);
          routeLayerRef.current = null;
      }
      // Remove old marker
      if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      // Add new marker
      if (selectedLocation) {
        const { lat, lng } = selectedLocation;
        markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        markerRef.current.bindPopup(`Selected: ${lat.toFixed(2)}, ${lng.toFixed(2)}`).openPopup();
      }
    }
  }, [selectedLocation]);
  
  // Control route display
  useEffect(() => {
    if (mapRef.current) {
        // Always clear the previous route layer.
        if (routeLayerRef.current) {
            mapRef.current.removeLayer(routeLayerRef.current);
            routeLayerRef.current = null;
        }

        // If a new route is being drawn, clear the single marker and add the route layers.
        if (route) {
            // This is now route mode, so clear any single marker pin.
            if (markerRef.current) {
                mapRef.current.removeLayer(markerRef.current);
                markerRef.current = null;
            }

            const startMarker = L.marker([route.start.lat, route.start.lng]).bindPopup('Start');
            const endMarker = L.marker([route.end.lat, route.end.lng]).bindPopup('End');
            
            const polylinePoints = routePolyline 
                ? routePolyline.map(p => [p.lat, p.lng] as [number, number])
                // Fallback to a straight line if the detailed route isn't available yet
                : [[route.start.lat, route.start.lng], [route.end.lat, route.end.lng]];

            const routeLine = L.polyline(
                polylinePoints, 
                { color: '#3b82f6', weight: 5, opacity: 0.7 }
            );

            const group = L.featureGroup([startMarker, endMarker, routeLine]).addTo(mapRef.current);
            routeLayerRef.current = group;
            // Adjust map view to show the entire route with some padding
            mapRef.current.fitBounds(group.getBounds().pad(0.2));
        }
    }
  }, [route, routePolyline]);


  return <div ref={mapContainerRef} className="h-full w-full rounded-lg shadow-lg border border-gray-200 dark:border-gray-700" />;
};

export default MapComponent;