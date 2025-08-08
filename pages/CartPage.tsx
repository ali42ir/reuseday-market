
import React, { useState } from 'react';
import { useCart } from '../context/CartContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, updateQuantity, cartSubtotal, cartTotal, appliedDiscount, applyDiscountCode } = useCart();
  const { t } = useLanguage();
  const [discountCodeInput, setDiscountCodeInput] = useState('');

  const handleApplyDiscount = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (discountCodeInput.trim()) {
      applyDiscountCode(discountCodeInput.trim().toUpperCase());
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('cart_title')}</h1>
      {cartItems.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h2 className="mt-4 text-2xl font-bold text-gray-800">{t('cart_empty')}</h2>
          <p className="mt-2 text-gray-500">{t('cart_empty_subtitle')}</p>
          <Link to="/" className="mt-6 inline-block bg-amazon-yellow text-amazon-blue font-bold py-3 px-8 rounded-lg hover:bg-amazon-yellow-light transition-colors text-lg">
            {t('cart_continue_shopping')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            {cartItems.map(item => (
              <div key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b py-4 last:border-b-0">
                <div className="flex items-center">
                  <img src={item.imageUrl} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md flex-shrink-0" />
                  <div className="ms-4">
                    <h2 className="text-lg font-semibold text-gray-800 hover:text-amazon-blue transition-colors">
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                    </h2>
                    <p className="text-gray-800 font-bold mt-1">€{item.price.toFixed(2)}</p>
                    <button onClick={() => removeFromCart(item.id)} className="sm:hidden mt-2 text-red-500 hover:text-red-700 font-semibold text-sm">
                      {t('cart_remove')}
                    </button>
                  </div>
                </div>
                <div className="flex items-center mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                    className="w-16 text-center border rounded-md"
                    aria-label={t('cart_quantity_aria', { name: item.name })}
                  />
                  <button onClick={() => removeFromCart(item.id)} className="hidden sm:block ms-4 text-red-500 hover:text-red-700 font-semibold text-sm">
                    {t('cart_remove')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md lg:sticky lg:top-24">
              <h2 className="text-xl font-bold border-b pb-4 mb-4">{t('cart_order_summary')}</h2>
              <form onSubmit={handleApplyDiscount} className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('cart_discount_code')}</label>
                <div className="flex">
                  <input
                    type="text"
                    value={discountCodeInput}
                    onChange={(e) => setDiscountCodeInput(e.target.value)}
                    className="w-full rounded-s-md px-3 py-2 border border-gray-300 text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-yellow"
                    placeholder={t('cart_enter_code_placeholder')}
                  />
                  <button type="submit" className="bg-gray-700 hover:bg-gray-800 text-white font-semibold px-4 rounded-e-md transition-colors">
                    {t('cart_apply_discount')}
                  </button>
                </div>
              </form>

              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{t('cart_subtotal')}</span>
                <span className="font-semibold text-gray-900">€{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{t('cart_shipping')}</span>
                <span className="font-semibold text-gray-900">{t('cart_shipping_free')}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between mb-4 text-green-600">
                  <span>{t('cart_discount_display', { code: appliedDiscount.code })} ({appliedDiscount.percentage}%)</span>
                  <span className="font-semibold">-€{(cartSubtotal - cartTotal).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl border-t pt-4 text-gray-900">
                <span>{t('cart_total')}</span>
                <span>€{cartTotal.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="w-full text-center block mt-6 bg-amazon-yellow text-amazon-blue font-bold py-3 rounded-lg hover:bg-amazon-yellow-light transition-colors">
                {t('cart_checkout')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;