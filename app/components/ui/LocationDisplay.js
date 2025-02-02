"use client"
import { useState,useEffect } from "react";
import { useLocation } from "@/app/contexts/LocationContext";

export const LocationDisplay = ({ onLocationSelect, onSetAddress }) => {
    const { location, locationStatus, isLoading } = useLocation();
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (location) {
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lon}`)
                .then(res => res.json())
                .then(data => {
                    if (data.display_name) {
                        setAddress(data.display_name);
                    }
                })
                .catch(error => console.error('Error fetching address:', error));
        }
    }, [location]);

    if (isLoading) return <div>Loading...</div>;
    if (locationStatus === 'denied') return <div>Location access denied</div>;
    if (!location) return <div>No location available</div>;

    return (
        <div>
            <p>Current location: {address || `${location.lat}, ${location.lon}`}</p>
            <div className="flex gap-2">
                {onLocationSelect && (
                    <button
                        onClick={() => onLocationSelect(location)}
                        className="bg-blue-500 text-white py-2 px-4 rounded"
                    >
                        Use This Location
                    </button>
                )}
                {onSetAddress && (
                    <button
                        onClick={onSetAddress}
                        className="bg-green-500 text-white py-2 px-4 rounded"
                    >
                        Set This Address
                    </button>
                )}
            </div>
        </div>
    );
};