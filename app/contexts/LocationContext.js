'use client';
import { createContext, useContext, useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';

const LocationContext = createContext();

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedPermission = localStorage.getItem('locationPermission');
    const storedLocation = localStorage.getItem('userLocation');

    if (storedLocation) {
      const parsedLocation = JSON.parse(storedLocation);
      const formattedLocation = {
        lat: parsedLocation.lat,
        lng: parsedLocation.lng || parsedLocation.lon
      };
      setLocation(formattedLocation);
      setSelectedLocation(formattedLocation);
    }

    if (storedPermission) {
      setLocationStatus(storedPermission);
    }

    setIsLoading(false);
  }, []);

  const requestLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationStatus('denied');
        localStorage.setItem('locationPermission', 'denied');
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(userLocation);
          setSelectedLocation(userLocation);
          setLocationStatus('granted');
          localStorage.setItem('locationPermission', 'granted');
          localStorage.setItem('userLocation', JSON.stringify(userLocation));
          resolve(userLocation);
        },
        (error) => {
          setLocationStatus('denied');
          localStorage.setItem('locationPermission', 'denied');
          reject(error);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    });
  };

  const clearLocation = () => {
    setLocation(null);
    setSelectedLocation(null);
    setLocationStatus('pending');
    localStorage.removeItem('locationPermission');
    localStorage.removeItem('userLocation');
  };

  return (
    <LocationContext.Provider value={{
      location,
      selectedLocation,
      setSelectedLocation,
      locationStatus,
      isLoading,
      requestLocation,
      clearLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};