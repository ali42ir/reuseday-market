import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useOrders } from '../context/OrderContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { useNavigate } from 'react-router-dom';
import type { Address, DeliveryOption } from '../types.ts';
import { useToast } from '../context/ToastContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';

const CheckoutPage: React.FC = () => {
    const { cartItems, cartTotal, clearCart, cartSubtotal, appliedDiscount } = useCart();
    const { placeOrder } = useOrders();
    const { t } = useLanguage();
    const { user } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [shippingAddress, setShippingAddress] = useState<Address>({
        fullName: user?.address?.fullName || user?.name || '',
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        zipCode: user?.address?.zipCode || '',
        country: user?.address?.country || '',
    });

    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryOption | null>(null);

    const availableDeliveryOptions = useMemo(() => {
        if (cartItems.length === 0) return { shippable: false, pickupable: false };
        
        const everyItemIsShippable = cartItems.every(item => 
            item.deliveryOptions.includes('shipping') || item.deliveryOptions.includes('free_shipping')
        );

        const everyItemIsPickupable = cartItems.every(item => 
            item.deliveryOptions.includes('local_pickup')
        );

        return { shippable: everyItemIsShippable, pickupable: everyItemIsPickupable };
    }, [cartItems]);
    
    useEffect(() => {
        // Pre-select an option if only one is available
        if (availableDeliveryOptions.shippable && !availableDeliveryOptions.pickupable) {
            setDeliveryMethod('shipping');
        } else if (!availableDeliveryOptions.shippable && availableDeliveryOptions.pickupable) {
            setDeliveryMethod('local_pickup');
        } else {
            setDeliveryMethod(null);
        }
    }, [availableDeliveryOptions]);


    const shippingCost = useMemo(() => {
        if (deliveryMethod !== 'shipping') return 0;
        return cartItems.reduce((total, item) => {
            if (item.deliveryOptions.includes('free_shipping')) return total;
            return total + (item.shippingCost || 0) * item.quantity;
        }, 0);
    }, [deliveryMethod, cartItems]);
    
    const orderTotal = useMemo(() => cartTotal + shippingCost, [cartTotal, shippingCost]);

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
    };

    const isAddressValid = useMemo(() => 
        Object.values(shippingAddress).every(field => field.trim() !== '')
    , [shippingAddress]);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAddressValid) {
            addToast(t('checkout_address_incomplete_toast'), 'error');
            return;
        }
        if (!deliveryMethod) {
            addToast(t('checkout_select_delivery_toast'), 'error');
            return;
        }

        setLoading(true);
        const order = await placeOrder(cartItems, cartTotal, shippingAddress, deliveryMethod, shippingCost);
        
        if (order) {
            clearCart();
            navigate(`/order-confirmation/${order.id}`);
        } else {
            setLoading(false);
            addToast(t('order_failed_toast'), 'error');
        }
    };

    useEffect(() => {
        if (!loading && cartItems.length === 0) {
            navigate('/cart');
        }
    }, [cartItems, navigate, loading]);
    
    if (cartItems.length === 0) {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('checkout_title')}</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">{t('checkout_shipping_address')}</h2>
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_full_name')}</label>
                                <input type="text" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">{t('form_street_address')}</label>
                                <input type="text" name="street" value={shippingAddress.street} onChange={handleAddressChange} className="mt-1 block w-full p-2 border-gray-300 rounded-md" required />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input type="text" name="city" placeholder={t('form_city')} value={shippingAddress.city} onChange={handleAddressChange} className="p-2 border-gray-300 rounded-md" required />
                                <input type="text" name="zipCode" placeholder={t('form_zip_code')} value={shippingAddress.zipCode} onChange={handleAddressChange} className="p-2 border-gray-300 rounded-md" required />
                                <input type="text" name="country" placeholder={t('form_country')} value={shippingAddress.country} onChange={handleAddressChange} className="p-2 border-gray-300 rounded-md" required />
                            </div>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h2 className="text-xl font-bold mb-4">{t('checkout_delivery_method')}</h2>
                         <div className="space-y-3">
                            {availableDeliveryOptions.shippable && (
                                <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${deliveryMethod === 'shipping' ? 'border-amazon-yellow bg-yellow-50' : ''}`}>
                                    <input type="radio" name="deliveryMethod" value="shipping" checked={deliveryMethod === 'shipping'} onChange={() => setDeliveryMethod('shipping')} className="h-4 w-4 text-amazon-yellow focus:ring-amazon-yellow"/>
                                    <span className="ml-3 font-medium">{t('delivery_option_shipping')}</span>
                                </label>
                             )}
                            {availableDeliveryOptions.pickupable && (
                                <label className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${deliveryMethod === 'local_pickup' ? 'border-amazon-yellow bg-yellow-50' : ''}`}>
                                    <input type="radio" name="deliveryMethod" value="local_pickup" checked={deliveryMethod === 'local_pickup'} onChange={() => setDeliveryMethod('local_pickup')} className="h-4 w-4 text-amazon-yellow focus:ring-amazon-yellow"/>
                                    <span className="ml-3 font-medium">{t('delivery_option_local_pickup')}</span>
                                    <span className="ml-auto text-sm text-gray-500">{t('delivery_local_pickup_desc')}</span>
                                </label>
                            )}
                         </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4">{t('checkout_payment_info')}</h2>
                        <p className="text-gray-600">{t('site_disclaimer_short')}</p>
                        <div className="mt-4 p-4 border rounded-md bg-gray-50">
                            <p className="font-semibold">{t('payment_method_card')}</p>
                            <p className="text-sm text-gray-500">{t('payment_card_demo_text')}</p>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md lg:sticky lg:top-24">
                        <h2 className="text-xl font-bold border-b pb-4 mb-4">{t('cart_order_summary')}</h2>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                             {cartItems.map(item => (
                                <div key={item.id} className="flex justify-between items-start text-sm">
                                    <span className="text-gray-600 w-3/4">{item.name} <span className="font-semibold">x{item.quantity}</span></span>
                                    <span className="font-semibold text-right">€{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                             ))}
                        </div>
                        <div className="border-t my-4 pt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('cart_subtotal')}</span>
                                <span className="font-semibold">€{cartSubtotal.toFixed(2)}</span>
                            </div>
                             {appliedDiscount && (
                                <div className="flex justify-between text-green-600">
                                  <span>{t('cart_discount_display', { code: appliedDiscount.code })}</span>
                                  <span className="font-semibold">-€{(cartSubtotal - cartTotal).toFixed(2)}</span>
                                </div>
                              )}
                            <div className="flex justify-between">
                                <span className="text-gray-600">{t('cart_shipping')}</span>
                                <span className="font-semibold">€{shippingCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-xl text-gray-900 border-t pt-2 mt-2">
                                <span>{t('cart_total')}</span>
                                <span>€{orderTotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <button onClick={handlePlaceOrder} disabled={loading || !isAddressValid || !deliveryMethod} className="w-full text-center mt-6 bg-amazon-yellow text-amazon-blue font-bold py-3 rounded-lg hover:bg-amazon-yellow-light transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                            {loading ? t('checkout_processing') : t('checkout_place_order')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;