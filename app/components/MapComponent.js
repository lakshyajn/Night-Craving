import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for the marker icons in Next.js
const icon = L.icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map click and drag handler component
function MapEvents({ onLocationSelect }) {
  const map = useMap();
  
  useEffect(() => {
    const handleMapClick = (e) => {
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
    };

    map.on('click', handleMapClick);
    return () => map.off('click', handleMapClick);
  }, [map, onLocationSelect]);

  return null;
}

const MapComponent = ({ userLocation, onLocationSelect }) => {
  const defaultLocation = { lat: 25.344, lng: 74.634 };
  const [position, setPosition] = useState(userLocation || defaultLocation);

  useEffect(() => {
    if (userLocation) {
      setPosition(userLocation);
    }
  }, [userLocation]);

  const handleDragEnd = (e) => {
    const marker = e.target;
    const position = marker.getLatLng();
    const newLocation = { lat: position.lat, lng: position.lng };
    setPosition(newLocation);
    onLocationSelect(newLocation);
  };

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-lg overflow-hidden">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={15}
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
        />
        <MapEvents onLocationSelect={onLocationSelect} />
        <Marker 
          position={[position.lat, position.lng]} 
          icon={icon}
          draggable={true}
          eventHandlers={{
            dragend: handleDragEnd,
          }}
        >
          <Popup>
            <div className="text-sm">
              Selected Location:<br />
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapComponent;