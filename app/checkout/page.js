'use client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '../contexts/CartContext';
import Image from 'next/image';
import Button from '../components/ui/Button';
import QuantityControl from '../components/ui/QuantityControl';
import logo from '../../public/logo.png';

const validateForm = (formValues) => {
  const requiredFields = [
    'firstName', 'lastName', 'phone', 'address', 
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

  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    apartment: '',
    city: '',
    state: 'Rajasthan',
    pinCode: '',
    country: 'India',
    subscribe: false
  });

  // 2. Client-side rendering state (ALWAYS first)
  const [isClient, setIsClient] = useState(false);

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
    setIsClient(true);

    if (cart.length === 0) {
      router.push('/');
    }
  }, [cart.length, router]);

  // 6. WhatsApp link generation (ALWAYS defined)
  const generateWhatsAppLink = useCallback((phoneNumber, message) => {
    const formattedPhoneNumber = `91${phoneNumber}`;
    return `https://wa.me/${formattedPhoneNumber}?text=${message}`;
  }, []);

  // 7. CRITICAL: Wrap complex logic in useCallback with ALL dependencies
  const handlePlaceOrder = useCallback(() => {
    // Validate form
    const missingFields = validateForm(formValues);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
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
        contactNo: formValues.phone,
        line1: formValues.address,
        line2: formValues.apartment || '',
      },
      totalAmount: calculateTotal(),
      orderId: orderId
    };

    // Generate WhatsApp message and link
    const message = createWhatsAppMessage(orderDetails);
    const whatsappLink = generateWhatsAppLink(formValues.phone, message);

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

  // 8. Prevent server-side rendering AFTER all hooks
  if (!isClient) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="justify-center items-center m-auto relative w-50">
        <Image src={logo} alt="After 10" />
      </div>
      <div className="justify-center items-center text-center px-0 py-8 m-auto justify-items-center text-nowrap bg-[#F5F5F5] text-xl text-[#333333] font-sans">Checkout</div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Cart Items Section */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Cart Items</h2>
            <div className="space-y-4">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex items-start space-x-4 border-b pb-4"
                >
                  {/* Item Image */}
                  <div className="relative w-20 h-20 flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-lg"
                    />
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
                      ₹{(item.price + (item.selectedAddons?.reduce((sum, addon) => sum + addon.price, 0) || 0)) * item.quantity}
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
                <span>₹{calculateTotal()}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span>₹{deliveryCharge}</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>₹{calculateTotal() + deliveryCharge}</span>
                </div>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full mt-2"
              onClick={() => router.push('/')}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Information and Shipping Address Section */}
      <div className="mt-4 items-center justify-center">
        <h2 className="text-xl font-bold mb-2">Contact Information</h2>
        <div className="p-4 rounded-md">
          {/* Email Section */}
          <div className="mb-2 mt-1">
            <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={formValues.email}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* Subscription Checkbox */}
          <div className="mb-2 mt-4">
            <input
              type="checkbox"
              id="subscribe"
              className="mr-2"
            />
            <label htmlFor="subscribe" className="text-gray-700 font-bold mb-2">
              I would like to receive exclusive emails with discounts and product information
            </label>
          </div>

          {/* Shipping Address Form */}
          <div className="rounded-md">
            <div className="text-xl font-bold mb-2">Shipping Address</div>

            {/* Country Dropdown */}
            <div className="">
              <label htmlFor="country" className="block text-gray-800 font-bold mb-2">
                Country/Region
              </label>
              <select
                id="country"
                className="mb-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              >
                <option value="India">India</option>
              </select>
            </div>

            {/* Name Inputs */}
            <div className="mb-2">
              <label htmlFor="firstName" className="block text-gray-800 font-bold mb-2">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                value={formValues.firstName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-2">
              <label htmlFor="lastName" className="block text-gray-700 font-bold mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                value={formValues.lastName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="phone" className="block text-gray-700 font-bold mb-2">
                Phone Number
              </label>
              <input
                type="text"
                id="phone"
                value={formValues.phone}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="address" className="block text-gray-700 font-bold mb-2">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formValues.address}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="apartment" className="block text-gray-700 font-bold mb-2">
                Apartment/Suite (Optional)
              </label>
              <input
                type="text"
                id="apartment"
                value={formValues.apartment}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="city" className="block text-gray-700 font-bold mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                value={formValues.city}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="state" className="block text-gray-700 font-bold mb-2">
                State
              </label>
              <input
                type="text"
                id="state"
                value={formValues.state}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="mb-2">
              <label htmlFor="pinCode" className="block text-gray-700 font-bold mb-2">
                PIN Code
              </label>
              <input
                type="text"
                id="pinCode"
                value={formValues.pinCode}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

          {/* Place Order Button */}
          <div className="mb-4 mt-8 flex justify-center items-center">
            <Button
              onClick={handlePlaceOrder}
              className="w-full"
              disabled={cart.length === 0}
            >
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </div>
    </div >
  );
}