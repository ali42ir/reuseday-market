
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrders } from '../context/OrderContext.tsx';
import { useLanguage } from '../context/LanguageContext.tsx';
import Spinner from '../components/Spinner.tsx';

const OrderConfirmationPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { getOrderById } = useOrders();
  const { t, language } = useLanguage();

  const order = getOrderById(orderId || '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600">Order Not Found</h2>
        <Spinner />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <svg className="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-gray-800">{t('order_confirmation_title')}</h1>
          <p className="text-gray-600 mt-2">{t('order_confirmation_subtitle')}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
          <h2 className="text-xl font-bold mb-4 border-b pb-3">{t('order_confirmation_summary_title')}</h2>
          <div className="flex justify-between items-center text-gray-600 mb-2">
            <span>{t('order_id')}:</span>
            <span className="font-mono">#{order.id.slice(-6)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-600 mb-4">
            <span>{t('order_date')}:</span>
            <span className="font-semibold">{formatDate(order.date)}</span>
          </div>
          
          <div className="space-y-3 border-t pt-4">
            {order.items.map(item => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center">
                    <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded-md mr-4" />
                    <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                </div>
                <p className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <div className="border-t mt-4 pt-4">
             <div className="flex justify-between text-gray-600">
                <span>{t('cart_subtotal')}</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
             <div className="flex justify-between text-gray-600 mb-2">
                <span>{t('cart_shipping')}</span>
                <span>{t('cart_shipping_free')}</span>
              </div>
             <div className="flex justify-between text-xl font-bold text-gray-900">
                <span>{t('cart_total')}</span>
                <span>€{order.total.toFixed(2)}</span>
              </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
            <Link to="/" className="bg-amazon-yellow text-amazon-blue font-bold py-2 px-6 rounded-lg hover:bg-amazon-yellow-light transition-colors">
              {t('cart_continue_shopping')}
            </Link>
            <Link to="/profile" className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">
              {t('order_confirmation_go_to_orders')}
            </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;