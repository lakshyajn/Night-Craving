import { useLocation } from "../../contexts/LocationContext";

export const LocationPrompt = () => {
    const { locationStatus, requestLocation } = useLocation();
    
    if (locationStatus !== 'pending') return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                <h2 className="text-xl font-bold mb-2">Allow Location Access</h2>
                <p className="mb-4">We need your location to provide better services.</p>
                <button
                    onClick={requestLocation}
                    className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                    Allow
                </button>
            </div>
        </div>
    );
};