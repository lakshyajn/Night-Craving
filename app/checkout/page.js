'use client';
import dynamic from 'next/dynamic';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import Image from 'next/image';
import Button from '../components/ui/Button';
import QuantityControl from '../components/ui/QuantityControl';
import logo from '../../public/logo.png';
import { useLocation } from '../contexts/LocationContext';
import { LocationDisplay } from '../components/ui/LocationDisplay';
import { LocationPrompt } from '../components/ui/LocationPrompt';

const MapComponent = dynamic(() => import('../components/MapComponent'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

const validateForm = (formValues) => {
  const requiredFields = [
    'firstName', 'lastName', 'Mobile_No', 'address',
    'city', 'state', 'pinCode'
  ];

  return requiredFields.filter(field =>
    !formValues[field] ||
    (typeof formValues[field] === 'string' && formValues[field].trim() === '')
  );
};

const createWhatsAppMessage = (orderDetails) => {
  const { userName, items, address, totalAmount, orderId } = orderDetails;

  const itemsDetail = items.map(item => {
    const addonsText = item.selectedAddons?.length
      ? `\n    Add-ons: ${item.selectedAddons.map(addon =>
        `${addon.name} (₹${addon.price})`).join(', ')}`
      : '';

    return `*${item.name} x ${item.quantity}*${addonsText}`;
  }).join('\n\n');

  const message = `
Hello ${userName}, Your order details:

# After10-OID: ${orderId}

Order details: 
${itemsDetail}

---------------------------------
💰 Subtotal: ₹${totalAmount}
🚚 Delivery Charge: ₹0
---------------------------------
💵 Grand Total: ₹${totalAmount + 0} INR
---------------------------------
Delivery Address:
${address.name}
📱 ${address.contactNo}
📍 ${address.line1}
   ${address.line2 || ''}
    `.trim();


  return encodeURIComponent(message);
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    updateQuantity,
    removeFromCart,
    calculateTotal,
    clearCart
  } = useCart();

  const deliveryCharge = 0; // Fixed delivery charge
  const totalAmount = useMemo(() => calculateTotal() + deliveryCharge, [cart, deliveryCharge]);
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);
  const {
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
  } = useLocation();

  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    Mobile_No: '',
    email: '',
    address: '',
    apartment: '',
    city: 'Bhilwara',
    state: 'Rajasthan',
    pinCode: '311001',
    country: 'India',
    subscribe: false
  });


  useEffect(() => {
    if (location?.lat && location?.lon) {
      setSelectedLocation(location);
      // Optionally fetch address using reverse geocoding
      fetchAddress(location);
    }
  }, [location]);

  // 3. Order ID generation (ALWAYS called)
  const orderId = useMemo(() => {
    return `A10-${Date.now().toString().slice(-6)}`;
  }, []);

  // 4. Input change handler (ALWAYS defined)
  const handleInputChange = useCallback((event) => {
    const { id, value, type, checked } = event.target;
    setFormValues(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  }, []);

  // 5. Redirect and client-side check effect
  useEffect(() => {

    if (cart.length === 0) {
      router.push('/');
    }
  }, [cart.length, router]);
  
  const [orderDetails, setOrderDetails] = useState({
    address: {
      line1: '',
      line2: '',
      contactNo: '',
      coordinates: null
    }
  });
  
  const handleUseCurrentLocation = async () => {
    try {
      const result = await requestLocation(); // This will now update location, selectedLocation, and address
      setMapOpen(false);
      
      // You can now use the address directly from the context
      setOrderDetails(prev => ({
        ...prev,
        address: {
          ...prev.address,
          line1: address,
          line2: '',
          coordinates: { lat: result.location.lat, lng: result.location.lng }
        }
      }));
  
      setFormValues(prev => ({
        ...prev,
        address: address
      }));
    } catch (error) {
      console.error('Error getting current location:', error);
      alert('Error getting location. Please try again.');
    }
  };
  
  const handleSetThisAddress = async () => {
    if (!selectedLocation) {
      alert('Please select a location.');
      return;
    }
  
    try {
      const userAddress = await setLocationWithAddress(selectedLocation);
      
      setOrderDetails(prev => ({
        ...prev,
        address: {
          ...prev.address,
          line1: userAddress,
          line2: '',
          coordinates: selectedLocation
        }
      }));
  
      setFormValues(prev => ({
        ...prev,
        address: userAddress
      }));
  

      setMapOpen(false);
    } catch (error) {
      console.error('Error setting address:', error);
      alert('Error setting address. Please try again.');
    }
  };
  
  // 6. WhatsApp link generation (ALWAYS defined)
  const generateWhatsAppLink = useCallback((phoneNumber, message) => {
    const formattedPhoneNumber = `91${phoneNumber}`;
    return `https://wa.me/${formattedPhoneNumber}?text=${message}`;
  }, []);

  // 7. CRITICAL: Wrap complex logic in useCallback with ALL dependencies
  const handlePlaceOrder = useCallback(() => {
    // Validate form
    const missingFields = validateForm(formValues);

    if (missingFields.length > 1) {
      alert(`Please fill in all required fields`);
      return;
    }

    // Prepare order details
    const orderDetails = {
      userName: `${formValues.firstName} ${formValues.lastName}`,
      items: cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        selectedAddons: item.selectedAddons
      })),
      address: {
        name: `${formValues.firstName} ${formValues.lastName}`,
        contactNo: formValues.Mobile_No,
        line1: formValues.address,
        line2: formValues.apartment || '',
      },
      totalAmount,
      orderId: orderId
    };

    // Generate WhatsApp message and link
    const message = createWhatsAppMessage(orderDetails);
    const whatsappLink = generateWhatsAppLink(formValues.Mobile_No, message);

    clearCart();

    // Open WhatsApp
    window.open(whatsappLink, '_blank');

    router.push('/');

  }, [
    formValues,
    cart,
    calculateTotal,
    orderId,
    generateWhatsAppLink
  ]);


  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {!location && locationStatus !== "denied" && <LocationPrompt />}

      <div className="justify-center items-center m-auto relative w-50">
        <Image src={logo} alt="After 10" />
      </div>

      <div className="text-center px-0 py-8 m-auto text-nowrap bg-[#F5F5F5] text-xl text-[#333333] font-sans">
        Checkout
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Cart Items Section */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div key={`${item.id}-${index}`} className="flex items-start space-x-4 border-b pb-4">
                  {/* Item Image */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    {item.selectedAddons?.length > 0 && (
                      <div className="text-sm text-gray-600 mt-1">
                        <p className="font-medium">Add-ons:</p>
                        <ul className="list-disc list-inside">
                          {item.selectedAddons.map((addon, idx) => (
                            <li key={idx}>
                              {addon.name} - ₹{addon.price}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="mt-2">
                      <QuantityControl
                        quantity={item.quantity}
                        onIncrease={() => updateQuantity(item.id, item.selectedAddons, item.quantity + 1)}
                        onDecrease={() => updateQuantity(item.id, item.selectedAddons, item.quantity - 1)}
                        size="sm"
                      />
                    </div>
                  </div>

                  {/* Item Price and Remove */}
                  <div className="text-right">
                    <p className="font-medium">
                      ₹
                      {(item.price +
                        (item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0)) *
                        item.quantity}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id, item.selectedAddons)}
                      className="text-sm text-red-600 mt-2 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary Section */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>₹{deliveryCharge}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{totalAmount + deliveryCharge}</span>
                </div>
              </div>
            </div>
            <Button variant="secondary" className="w-full mt-2" onClick={() => router.push("/")}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Information and Shipping Address Section */}
      <div className="mt-4 items-center justify-center">
        <h2 className="text-xl font-bold mb-2">Contact Information</h2>
        <div className="p-4 rounded-md">
          <div className="mb-2">
            <label htmlFor="Mobile_No" className="block text-gray-900 font-bold mb-2">
              Contact
            </label>
            <input
              type="text"
              id="Mobile_No"
              required
              value={formValues.Mobile_No}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Shipping Address */}
          <div className="rounded-md mt-4">
            <div className="text-xl font-bold mb-2">Shipping Address</div>
            <div className="mb-2">
              <label htmlFor="firstName" className="block text-gray-900 font-bold mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                required
                value={formValues.firstName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="lastName" className="block text-gray-900 font-bold mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Address Input */}
            <div className="mt-6 space-y-6">
              <div>
                <label htmlFor="address" className="block text-gray-700 font-bold mb-2">
                  Address
                </label>
                <button
                  onClick={() => setMapOpen(true)}
                  className="w-full py-2 px-4 border rounded-lg bg-gray-100 hover:bg-gray-200 text-left"
                >
                  {formValues.address || "Select Address"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Map Modal */}
        {mapOpen && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-lg shadow-lg relative flex flex-col h-[80vh] px-6 pb-8">
              <button
                onClick={() => setMapOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md"
              >
                ✕
              </button>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Select Location</h3>
                  <p className="text-sm text-gray-500">Drag the pin or tap to select location</p>
                </div>

                {/* Map Container */}
                <div className="w-full h-[50vh] mb-6 rounded-lg border border-gray-300 overflow-hidden">
                  <MapComponent
                    userLocation={selectedLocation || location}
                    onLocationSelect={setSelectedLocation}
                  />
                </div>

                {/* Buttons */}
                <div className="space-y-4">
                  <button
                    onClick={handleUseCurrentLocation}
                    className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-colors"
                  >
                    <span className="mr-2">📍</span> Use Current Location
                  </button>
                  <button
                    onClick={handleSetThisAddress}
                    className="w-full py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    Set This Address
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other address fields */}
        {!mapOpen && (
          <div className="px-6"> {/* Ensured consistent padding */}
            <div className="mb-4">
              <label htmlFor="apartment" className="block text-gray-900 font-bold mb-2">
                Apartment/Landmark
              </label>
              <input
                type="text"
                id="apartment"
                value={formValues.apartment}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="city" className="block text-gray-900 font-bold mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                value={formValues.city}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="state" className="block text-gray-900 font-bold mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                value={formValues.state}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="pinCode" className="block text-gray-900 font-bold mb-2">
                PIN Code
              </label>
              <input
                type="text"
                id="pinCode"
                value={formValues.pinCode}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Country Input */}
            <div className="mb-4">
              <label htmlFor="country" className="block text-gray-900 font-bold mb-2">
                Country/Region
              </label>
              <input
                id="country"
                type="text"
                value={formValues.country}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-900 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Place Order Button */}
            <div className="mb-8 flex justify-center items-center">
              <Button
                onClick={handlePlaceOrder}
                className="w-full"
                disabled={cart.length === 0}
              >
                Place Order
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}  