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
        <h2 className="text-2xl font-bold text-red-600">{t('order_not_found_title')}</h2>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t('order_confirmation_title')}</h1>
          <p className="text-gray-600 mb-6">{t('order_confirmation_subtitle')}</p>
          <div className="border-t border-b py-4 my-4 text-left">
            <h3 className="text-lg font-semibold mb-2">{t('order_confirmation_summary_title')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{t('order_id')}:</span>
                <span className="font-medium text-gray-900">#{order.id.slice(-6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('order_date')}:</span>
                <span className="font-medium text-gray-900">{formatDate(order.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('order_total')}:</span>
                <span className="font-medium text-gray-900">€{order.total.toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4">
              {order.items.map(item => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                  <div className="flex items-center">
                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md mr-4" />
                    <div>
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-sm text-gray-500">x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">€{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
          <Link to="/profile/orders" className="w-full sm:w-auto inline-block mt-6 bg-amazon-yellow text-amazon-blue font-bold py-3 px-6 rounded-lg hover:bg-amazon-yellow-light transition-colors">
            {t('order_confirmation_go_to_orders')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
