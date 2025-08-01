import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useOrders } from '../context/OrderContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useNavigate } from 'react-router-dom';
import type { Address } from '../types.ts';
import { useToast } from '../context/ToastContext.tsx';

// SVG Icons for Payment Methods
const CardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
);
const PayPalIcon = () => (
    <svg className="h-8 w-8 mr-3" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.332 21.329h3.687c.563 0 1.012-.449 1.012-1.012v-1.123c0-.076.014-.15.04-.222.019-.052.04-.102.064-.15.076-.15.18-.285.3-.404.13-.127.273-.24.423-.344.425-.285.938-.4 1.5-.4h.012c4.012 0 6.137-2.188 6.5-6.075.313-3.325-1.937-5.437-5.075-5.437H8.344c-.563 0-1.012.45-1.012 1.013v13.187c0 .562.45 1.012 1.012 1.012zm.888-14.15c0-.04.012-.08.013-.125.012-.075.025-.138.05-.2.037-.088.087-.163.15-.225.113-.113.263-.175.425-.175h4.638c1.925 0 3.162 1.025 2.937 3.013-.213 1.887-1.638 2.8-3.563 2.8h-1.9c-.562 0-1.012.45-1.012 1.012v.388c0 .562.45 1.012 1.012 1.012h1.475c.488 0 .938-.137 1.3-.375.388-.237.663-.587.813-1.025.025-.075.063-.137.1-.212.025-.063.05-.125.063-.188.012-.062.025-.125.025-.187v-.025c0-.013 0-.025 0-.037.062-.575.462-1.038.987-1.163.575-.137 1.163.225 1.3.8.125.575-.225 1.162-.8 1.3-.062.012-.112.037-.175.05-.05.013-.1.025-.137.05-.1.037-.188.087-.275.137-.313.188-.6.388-.863.6-.325.262-.613.562-.863.9-.313.412-.537.875-.65 1.4-.125.525-.162 1.075-.138 1.625v.012c0 .05 0 .1.013.15.225 2.6-1.387 3.975-3.837 3.975h-2.238c-.088 0-.162-.038-.225-.088-.062-.062-.087-.137-.087-.225v-12.2z"/>
    </svg>
);
const GooglePayIcon = () => (
    <svg className="h-8 w-8 mr-3" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20.324 8.653V8.64h-.002c-.066-2.394-1.69-4.44-3.924-5.235V3.4h-2.43v.37c-1.334.337-2.432 1.18-3.09 2.35h-2.14V3.4H6.29v2.72c-2.49 1.192-3.87 3.48-3.87 5.928 0 2.45 1.378 4.74 3.87 5.93v2.72h2.43v-2.72c.854.33 1.773.498 2.71.498 2.22 0 4.29-.93 5.72-2.58l-1.63-1.452c-1.002 1.11-2.434 1.73-4.09 1.73-2.316 0-4.22-1.67-4.52-3.88h9.63c.03-.26.04-.52.04-.79 0-1.49-.44-2.9-1.25-4.08zm-11.66 3.03c.26-1.9 1.94-3.328 3.9-3.328 1.96 0 3.63 1.42 3.9 3.33H8.664z"/>
    </svg>
);


const CheckoutPage: React.FC = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const { t } = useLanguage();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState<Address>({
    fullName: '', street: '', city: '', zipCode: '', country: '',
  });
  const [cardDetails, setCardDetails] = useState({ cardNumber: '', expiry: '', cvc: '' });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'google_pay'>('card');

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };
  
  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    const order = await placeOrder(cartItems, cartTotal, address);
    setLoading(false);
    if (order) {
      addToast(t('checkout_order_success_message'), 'success');
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } else {
      addToast('Failed to place order.', 'error');
    }
  };

  if (cartItems.length === 0 && step < 4) {
      navigate('/');
      return null;
  }

  const isAddressFormValid = () => Object.values(address).every(field => field.trim() !== '');
  const isCardFormValid = () => Object.values(cardDetails).every(field => field.trim() !== '');
  
  const isPaymentStepValid = () => {
    if (paymentMethod === 'card') {
      return isCardFormValid();
    }
    // For PayPal and Google Pay, we assume they are valid once selected
    return true;
  };
  
  const getPaymentMethodReviewText = () => {
    switch(paymentMethod) {
      case 'card':
        return t('payment_method_review_card', { last4: cardDetails.cardNumber.slice(-4) });
      case 'paypal':
        return t('payment_method_review_paypal');
      case 'google_pay':
        return t('payment_method_review_google_pay');
      default:
        return '';
    }
  }

  const renderStep = () => {
    switch(step) {
      case 1: // Shipping Address
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{t('checkout_shipping_address')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('form_full_name')}</label>
                <input type="text" name="fullName" value={address.fullName} onChange={handleAddressChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('form_street_address')}</label>
                <input type="text" name="street" value={address.street} onChange={handleAddressChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('form_city')}</label>
                <input type="text" name="city" value={address.city} onChange={handleAddressChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">{t('form_zip_code')}</label>
                <input type="text" name="zipCode" value={address.zipCode} onChange={handleAddressChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required inputMode="numeric" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('form_country')}</label>
                <input type="text" name="country" value={address.country} onChange={handleAddressChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" required />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button onClick={() => setStep(2)} disabled={!isAddressFormValid()} className="bg-amazon-yellow text-amazon-blue font-bold py-3 px-8 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                {t('checkout_next_step')}
              </button>
            </div>
          </div>
        );
      case 2: // Payment Information
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">{t('checkout_payment_method')}</h2>
            <div className="space-y-4">
                <div onClick={() => setPaymentMethod('card')} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-amazon-yellow shadow-md' : 'border-gray-200'}`}>
                    <CardIcon />
                    <span className="font-semibold text-gray-700">{t('payment_method_card')}</span>
                </div>
                <div onClick={() => setPaymentMethod('paypal')} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'paypal' ? 'border-amazon-yellow shadow-md' : 'border-gray-200'}`}>
                    <PayPalIcon />
                    <span className="font-semibold text-gray-700">{t('payment_method_paypal')}</span>
                </div>
                <div onClick={() => setPaymentMethod('google_pay')} className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === 'google_pay' ? 'border-amazon-yellow shadow-md' : 'border-gray-200'}`}>
                    <GooglePayIcon />
                    <span className="font-semibold text-gray-700">{t('payment_method_google_pay')}</span>
                </div>
            </div>
            
            {paymentMethod === 'card' && (
                <div className="mt-6 pt-6 border-t animate-[fadeIn_0.5s_ease-in-out]">
                    <style>{`
                        @keyframes fadeIn {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">{t('form_card_number')}</label>
                          <input type="tel" name="cardNumber" value={cardDetails.cardNumber} onChange={handlePaymentChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="•••• •••• •••• ••••" required inputMode="numeric" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">{t('form_card_expiry')}</label>
                              <input type="text" name="expiry" value={cardDetails.expiry} onChange={handlePaymentChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="MM/YY" required inputMode="numeric" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">{t('form_card_cvc')}</label>
                              <input type="text" name="cvc" value={cardDetails.cvc} onChange={handlePaymentChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3" placeholder="CVC" required inputMode="numeric" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex justify-between mt-6">
              <button onClick={() => setStep(1)} className="bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg">
                  {t('checkout_prev_step')}
              </button>
              <button onClick={() => setStep(3)} disabled={!isPaymentStepValid()} className="bg-amazon-yellow text-amazon-blue font-bold py-3 px-8 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {t('checkout_next_step')}
              </button>
            </div>
          </div>
        );
      case 3: // Review
        return (
           <div>
            <h2 className="text-xl font-bold mb-4">{t('checkout_order_summary')}</h2>
             <div className="space-y-2 mb-4">
               {cartItems.map(item => (
                 <div key={item.id} className="flex justify-between">
                   <span>{item.name} x {item.quantity}</span>
                   <span>€{(item.price * item.quantity).toFixed(2)}</span>
                 </div>
               ))}
             </div>
             <div className="border-t pt-4">
                <p className="font-semibold">{t('checkout_shipping_to')}: <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline ml-2">Change</button></p>
                <p>{address.fullName}, {address.street}, {address.city}, {address.zipCode}, {address.country}</p>
             </div>
              <div className="border-t pt-4 mt-4">
                <p className="font-semibold">{t('checkout_payment_method')}: <button onClick={() => setStep(2)} className="text-sm text-blue-600 hover:underline ml-2">Change</button></p>
                <p>{getPaymentMethodReviewText()}</p>
             </div>
             <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                 <p className="text-sm text-yellow-900">{t('site_disclaimer_short')}</p>
             </div>
             <div className="flex justify-between mt-6">
              <button onClick={() => setStep(2)} className="bg-gray-300 text-gray-800 font-bold py-3 px-8 rounded-lg">
                  {t('checkout_prev_step')}
              </button>
              <button onClick={handlePlaceOrder} disabled={loading} className="bg-amazon-yellow text-amazon-blue font-bold py-3 px-8 rounded-lg disabled:bg-gray-400">
                  {loading ? 'Processing...' : t('checkout_place_order')}
              </button>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('checkout_title')}</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
          {renderStep()}
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
            <h2 className="text-xl font-bold border-b pb-4 mb-4">{t('cart_order_summary')}</h2>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">{t('cart_subtotal')}</span>
              <span className="font-semibold text-gray-900">€{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4">
              <span className="text-gray-600">{t('cart_shipping')}</span>
              <span className="font-semibold text-gray-900">{t('cart_shipping_free')}</span>
            </div>
            <div className="flex justify-between font-bold text-xl border-t pt-4 text-gray-900">
              <span>{t('cart_total')}</span>
              <span>€{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CheckoutPage;