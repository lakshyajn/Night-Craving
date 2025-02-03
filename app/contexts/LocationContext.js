'use client';
import { createContext, useContext, useState, useEffect } from "react";
import 'leaflet/dist/leaflet.css';

const LocationContext = createContext();

const fetchAddress = async (latitude, longitude) => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&namedetails=1&extratags=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });
    const data = await response.json();

    if (data.address) {
      const {
        house_number,
        road,
        neighbourhood,
        suburb,
        city,
        state,
        country,
        amenity,
        shop,
        building
      } = data.address;

      // Build address parts in order of specificity
      const addressParts = [];

      // Add house number and building name if available
      if (house_number) addressParts.push(house_number);
      if (building && building !== house_number) addressParts.push(building);

      // Add road
      if (road) addressParts.push(road);

      // Add nearby landmark or amenity
      if (amenity || shop) {
        const landmark = amenity || shop;
        addressParts.push(`Near ${landmark}`);
      }

      // Add neighborhood or suburb
      if (neighbourhood || suburb) {
        addressParts.push(neighbourhood || suburb);
      }

      // Add city and state
      if (city) addressParts.push(city);
      if (state) addressParts.push(state);
      if (country) addressParts.push(country);

      // Join all parts with commas and remove any extra spaces or commas
      return addressParts
        .filter(Boolean)
        .join(', ')
        .replace(/,\s*,/g, ',')
        .replace(/^\s*,\s*|\s*,\s*$/g, '')
        .trim();
    }

    return 'Address not found';
  } catch (error) {
    console.error('Error fetching address:', error);
    return 'Error fetching address';
  }
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('pending');
  const [isLoading, setIsLoading] = useState(true);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const storedPermission = localStorage.getItem('locationPermission');
    const storedLocation = localStorage.getItem('userLocation');
    const storedAddress = localStorage.getItem('userAddress');

    if (storedLocation) {
      const parsedLocation = JSON.parse(storedLocation);
      const formattedLocation = {
        lat: parsedLocation.lat,
        lng: parsedLocation.lng || parsedLocation.lon
      };
      setLocation(formattedLocation);
      setSelectedLocation(formattedLocation);
      if (storedAddress) {
        setAddress(storedAddress);
      }
    }

    if (storedPermission) {
      setLocationStatus(storedPermission);
    }

    setIsLoading(false);
  }, []);

  const requestLocation = async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setLocationStatus('denied');
        localStorage.setItem('locationPermission', 'denied');
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          try {
            const userAddress = await fetchAddress(userLocation.lat, userLocation.lng);
            setAddress(userAddress);
            localStorage.setItem('userAddress', userAddress);
          } catch (error) {
            console.error('Error fetching address:', error);
          }

          setLocation(userLocation);
          setSelectedLocation(userLocation);
          setLocationStatus('granted');
          localStorage.setItem('locationPermission', 'granted');
          localStorage.setItem('userLocation', JSON.stringify(userLocation));
          resolve({ location: userLocation, address: address });
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

  const setLocationWithAddress = async (newLocation) => {
    try {
      const userAddress = await fetchAddress(newLocation.lat, newLocation.lng);
      setSelectedLocation(newLocation);
      setAddress(userAddress);
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
      localStorage.setItem('userAddress', userAddress);
      return userAddress;
    } catch (error) {
      console.error('Error setting location with address:', error);
      throw error;
    }
  };

  const clearLocation = () => {
    setLocation(null);
    setSelectedLocation(null);
    setLocationStatus('pending');
    setAddress('');
    localStorage.removeItem('locationPermission');
    localStorage.removeItem('userLocation');
    localStorage.removeItem('userAddress');
  };

  return (
    <LocationContext.Provider value={{
      location,
      selectedLocation,
      setSelectedLocation,
      locationStatus,
      isLoading,
      requestLocation,
      clearLocation,
      address,
      setLocationWithAddress,
      fetchAddress
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