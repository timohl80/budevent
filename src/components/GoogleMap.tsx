'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export interface MapLocation {
  lat: number;
  lng: number;
  address?: string;
}

interface GoogleMapProps {
  center?: MapLocation;
  zoom?: number;
  className?: string;
  height?: string;
  onLocationSelect?: (location: MapLocation) => void;
  showLocationPicker?: boolean;
  markers?: MapLocation[];
}

export default function GoogleMap({ 
  center = { lat: 59.3293, lng: 18.0686 }, // Stockholm default
  zoom = 12,
  className = "w-full",
  height = "400px",
  onLocationSelect,
  showLocationPicker = false,
  markers = []
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
          throw new Error('Google Maps API key not found');
        }

        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['geocoding', 'places']
        });

        await loader.load();

        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center,
            zoom,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            zoomControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
              }
            ]
          });

          mapInstanceRef.current = map;

          // Add click listener for location picking
          if (showLocationPicker && onLocationSelect) {
            map.addListener('click', async (event: google.maps.MapMouseEvent) => {
              if (event.latLng) {
                const lat = event.latLng.lat();
                const lng = event.latLng.lng();
                
                // Get address from coordinates
                const geocoder = new google.maps.Geocoder();
                const result = await geocoder.geocode({ 
                  location: { lat, lng },
                  componentRestrictions: { country: 'SE' }
                });
                
                const address = result.results[0]?.formatted_address || '';
                
                onLocationSelect({ lat, lng, address });
              }
            });
          }

          // Add markers
          markers.forEach(marker => {
            const googleMarker = new google.maps.Marker({
              position: { lat: marker.lat, lng: marker.lng },
              map,
              title: marker.address || 'Event Location',
              animation: google.maps.Animation.DROP
            });
            
            markersRef.current.push(googleMarker);
          });

          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error initializing Google Maps:', error);
        setError(error instanceof Error ? error.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      // Clear markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [center.lat, center.lng, zoom, showLocationPicker, onLocationSelect, markers]);

  // Update map center when center prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center);
    }
  }, [center.lat, center.lng]);

  // Update markers when markers prop changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];

      // Add new markers
      markers.forEach(marker => {
        const googleMarker = new google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: mapInstanceRef.current!,
          title: marker.address || 'Event Location',
          animation: google.maps.Animation.DROP
        });
        
        markersRef.current.push(googleMarker);
      });
    }
  }, [markers]);

  if (error) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-center text-gray-600">
          <div className="text-2xl mb-2">🗺️</div>
          <p className="text-sm">Failed to load map</p>
          <p className="text-xs text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`} style={{ height }}>
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="rounded-lg shadow-lg"
        style={{ height }}
      />
      {showLocationPicker && (
        <div className="mt-2 text-xs text-gray-600 text-center">
          💡 Click on the map to select a location
        </div>
      )}
    </div>
  );
}
