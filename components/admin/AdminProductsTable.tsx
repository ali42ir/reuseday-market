
import React, { useState } from 'react';
import type { Product } from '../../types.ts';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { useProductContext } from '../../context/ProductContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import EditProductModal from '../EditProductModal.tsx';

interface AdminProductsTableProps {
    products: Product[];
    onDeleteProduct: (productId: number) => void;
}

const AdminProductsTable: React.FC<AdminProductsTableProps> = ({ products, onDeleteProduct }) => {
    const { t } = useLanguage();
    const { updateProductAsAdmin } = useProductContext();
    const { addToast } = useToast();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const handleUpdate = (updatedData: any) => {
        if (editingProduct) {
            const parsedData = { ...updatedData, price: parseFloat(updatedData.price) };
            if(updateProductAsAdmin(editingProduct.id, parsedData)) {
                addToast(t('seller_product_updated_toast'), 'success');
            }
            setEditingProduct(null);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
             {editingProduct && <EditProductModal product={editingProduct} onSave={handleUpdate} onClose={() => setEditingProduct(null)} />}
            <h2 className="text-xl font-bold mb-4">{t('admin_products_title')} ({products.length})</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_product_id')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_product_name')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_product_seller')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_product_price')}</th>
                            <th scope="col" className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin_actions_header')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sellerName} (ID: {product.sellerId})</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">€{product.price.toFixed(2)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                                    <button onClick={() => setEditingProduct(product)} className="text-blue-600 hover:text-blue-900">{t('seller_edit_product_button')}</button>
                                    <button onClick={() => onDeleteProduct(product.id)} className="text-red-600 hover:text-red-900">{t('admin_delete_button')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductsTable;