'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, MapPin, ArrowRight, Package, User, Loader2, AlertCircle, X } from 'lucide-react';
import { ProductDTO, ProfileResponseDTO } from '@/types/api';
import { getProducts } from '@/services/products/product.service';
import { getProfile } from '../settings/actions';
import { createOrder } from '../orders/orderApi';
import { formatCompactDollar, formatDollar } from '@/lib/currency';
import { ConfirmModal } from '@/components/ConfirmModal';

type SearchMode = 'product' | 'jastiper';

function formatDate(value: string) {
  if (!value) return 'No date set';
  const date = getLocalDateBoundary(value);
  if (!date) return 'No date set';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function getLocalDateBoundary(value: string) {
  if (!value) return null;
  const [datePart] = value.split('T');
  const parts = datePart.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

function isProductAvailableForWar(product: ProductDTO, today = new Date()) {
  const tripDate = getLocalDateBoundary(product.purchaseDate);
  if (!tripDate) return true;

  const currentDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return tripDate >= currentDate;
}

export default function MarketplacePage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [profile, setProfile] = useState<ProfileResponseDTO | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ quantity: '1', shippingAddress: '' });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('product');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [productResult, profileResult] = await Promise.allSettled([getProducts(), getProfile()]);
        if (productResult.status === 'fulfilled') {
          setProducts(productResult.value);
        } else {
          setError(productResult.reason instanceof Error ? productResult.reason.message : 'Failed to fetch products');
        }

        if (profileResult.status === 'fulfilled' && profileResult.value.success === true) {
          setProfile(profileResult.value.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setIsLoading(false);
      }
    }

    loadProducts();
  }, []);

  const availableProducts = useMemo(() => products.filter((product) => isProductAvailableForWar(product)), [products]);

  const filteredProducts = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return availableProducts;

    return availableProducts.filter((product) => {
      const value = searchMode === 'product' ? product.name : product.jastiperId;
      return value.toLowerCase().includes(keyword);
    });
  }, [availableProducts, searchMode, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-6xl font-black uppercase mb-4">Marketplace</h1>
          <p className="text-xl font-bold border-l-8 border-black pl-4">
            Find limited items from verified Jastipers and join fair war sessions before stock runs out.
          </p>
        </div>
        <div className="border-4 border-black bg-white px-5 py-4 shadow-[6px_6px_0px_0px_#000]">
          <p className="text-xs font-black uppercase text-gray-500">Available Products</p>
          <p className="text-4xl font-black">{availableProducts.length}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={24} />
          <input
            type="text"
            placeholder={searchMode === 'product' ? 'Search by product name...' : 'Search by Jastiper ID...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-4 border-black p-4 pl-14 font-bold text-xl shadow-[8px_8px_0px_0px_#000] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all"
          />
        </div>
        <div className="flex gap-2">
          <ModeButton active={searchMode === 'product'} onClick={() => setSearchMode('product')} icon={<Package size={20} />} label="By Product" />
          <ModeButton active={searchMode === 'jastiper'} onClick={() => setSearchMode('jastiper')} icon={<User size={20} />} label="By Jastiper" />
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-4 border-black p-5 mb-10 flex items-center gap-3 font-black shadow-[6px_6px_0px_0px_#000]">
          <AlertCircle size={24} />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="border-4 border-black bg-white p-12 flex items-center justify-center gap-4 font-black text-2xl shadow-[10px_10px_0px_0px_#000]">
          <Loader2 className="animate-spin" /> Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="border-4 border-black bg-white p-12 text-center shadow-[10px_10px_0px_0px_#000]">
          <p className="text-3xl font-black uppercase">No products found</p>
          <p className="font-bold text-gray-600 mt-2">Try a different product name or Jastiper ID.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((product, index) => (
            <MarketplaceCard
              key={product.id}
              product={product}
              profile={profile}
              color={CARD_COLORS[index % CARD_COLORS.length]}
              onCheckout={(item) => {
                setSelectedProduct(item);
                setCheckoutForm({ quantity: '1', shippingAddress: '' });
                setError(null);
              }}
            />
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!profile?.id) {
                setError('Please login before checkout');
                return;
              }

              if (!isProductAvailableForWar(selectedProduct)) {
                setSelectedProduct(null);
                setError('This war session has ended');
                return;
              }

              const quantity = Number(checkoutForm.quantity);
              if (!quantity || quantity < 1 || quantity > selectedProduct.stock) {
                setError('Quantity must be available in stock');
                return;
              }

              if (!checkoutForm.shippingAddress.trim()) {
                setError('Shipping address is required');
                return;
              }

              setIsCheckoutConfirmOpen(true);
            }}
            className="w-full max-w-xl border-4 border-black bg-white p-6 shadow-[12px_12px_0px_0px_#000]"
          >
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase text-gray-500">Order confirmation</p>
                <h2 className="text-3xl font-black uppercase">{selectedProduct.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedProduct(null)} className="border-4 border-black p-2 hover:bg-red-300">
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 border-4 border-black bg-yellow-100 p-4 font-bold md:grid-cols-3">
              <div>
                <span className="block text-xs font-black uppercase text-gray-500">Unit Price</span>
                <span className="block truncate" title={formatDollar(selectedProduct.price)}>{formatCompactDollar(selectedProduct.price)}</span>
              </div>
              <div>
                <span className="block text-xs font-black uppercase text-gray-500">Stock Left</span>
                {selectedProduct.stock}
              </div>
              <div>
                <span className="block text-xs font-black uppercase text-gray-500">Estimate</span>
                <span className="block truncate" title={formatDollar(selectedProduct.price * Number(checkoutForm.quantity || 0))}>
                  {formatCompactDollar(selectedProduct.price * Number(checkoutForm.quantity || 0))}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <label>
                <span className="mb-1 block text-xs font-black uppercase text-gray-500">Quantity</span>
                <input
                  type="number"
                  min={1}
                  max={selectedProduct.stock}
                  value={checkoutForm.quantity}
                  onChange={(event) => setCheckoutForm((current) => ({ ...current, quantity: event.target.value }))}
                  className="w-full border-4 border-black p-4 font-bold shadow-[4px_4px_0px_0px_#000]"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-black uppercase text-gray-500">Shipping Address</span>
                <textarea
                  rows={4}
                  value={checkoutForm.shippingAddress}
                  onChange={(event) => setCheckoutForm((current) => ({ ...current, shippingAddress: event.target.value }))}
                  className="w-full border-4 border-black p-4 font-bold shadow-[4px_4px_0px_0px_#000]"
                />
              </label>
            </div>

            <button
              disabled={isCheckingOut}
              className="mt-6 flex w-full items-center justify-center gap-2 border-4 border-black bg-black p-4 text-xl font-black uppercase text-white hover:bg-main hover:text-black disabled:opacity-60"
            >
              {isCheckingOut ? <Loader2 className="animate-spin" /> : <ArrowRight />}
              {isCheckingOut ? 'Checking out...' : 'Confirm Order'}
            </button>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(selectedProduct && isCheckoutConfirmOpen)}
        title="Place Order?"
        message={`Create an order for ${selectedProduct?.name || 'this item'} with quantity ${checkoutForm.quantity}.`}
        confirmText="Place Order"
        confirmClassName="bg-black text-white hover:bg-main hover:text-black"
        isLoading={isCheckingOut}
        onCancel={() => setIsCheckoutConfirmOpen(false)}
        onConfirm={async () => {
          if (!selectedProduct || !profile?.id) return;
          if (!isProductAvailableForWar(selectedProduct)) {
            setIsCheckoutConfirmOpen(false);
            setSelectedProduct(null);
            setError('This war session has ended');
            return;
          }

          const quantity = Number(checkoutForm.quantity);
          setIsCheckingOut(true);
          setError(null);

          try {
            const order = await createOrder({
              productId: selectedProduct.id,
              titipersId: profile.id,
              jastiperId: selectedProduct.jastiperId,
              quantity,
              shippingAddress: checkoutForm.shippingAddress.trim(),
            });
            setIsCheckoutConfirmOpen(false);
            setSelectedProduct(null);
            router.push(`/dashboard/orders/${order.orderId}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Checkout failed');
          } finally {
            setIsCheckingOut(false);
          }
        }}
      />
    </div>
  );
}

const CARD_COLORS = ['bg-cyan-300', 'bg-green-300', 'bg-pink-300', 'bg-yellow-300', 'bg-purple-300', 'bg-orange-300'];

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-5 py-4 font-black uppercase whitespace-nowrap border-4 border-black transition-all flex items-center gap-2 ${
        active ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white text-black shadow-[4px_4px_0px_0px_#000] hover:bg-gray-50'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function MarketplaceCard({
  product,
  profile,
  color,
  onCheckout,
}: {
  product: ProductDTO;
  profile: ProfileResponseDTO | null;
  color: string;
  onCheckout: (product: ProductDTO) => void;
}) {
  const inStock = product.stock > 0;
  const isOwnProduct = Boolean(profile?.id && product.jastiperId === profile.id);

  return (
    <motion.div
      whileHover={{ y: -10 }}
      className={`border-4 border-black ${color} shadow-[12px_12px_0px_0px_#000] flex flex-col h-full`}
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className={`border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000] ${inStock ? 'bg-white' : 'bg-gray-300'}`}>
            {inStock ? `${product.stock} left` : 'Sold out'}
          </div>
          <div className="flex items-center gap-1 font-bold text-sm text-right">
            <MapPin size={16} /> {product.originCountry}
          </div>
        </div>

        <h3 className="text-3xl font-black mb-3 uppercase leading-none break-words">{product.name}</h3>
        <p className="font-bold opacity-80 leading-snug mb-5">{product.description || 'No description provided.'}</p>

        <div className="bg-white border-4 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_#000]">
          <p className="text-xs font-black uppercase text-gray-500 mb-1">Secured Price</p>
          <p className="truncate text-2xl font-black" title={formatDollar(product.price)}>{formatCompactDollar(product.price)}</p>
        </div>

        <div className="bg-white/80 border-2 border-black p-3 font-bold">
          Jastiper trip date: {formatDate(product.purchaseDate)}
        </div>
      </div>

      {isOwnProduct ? (
        <div className="w-full bg-yellow-100 text-black p-5 font-black text-lg uppercase flex items-center justify-center gap-2 border-t-4 border-black">
          Your Product
        </div>
      ) : (
        <button
          disabled={!inStock}
          onClick={() => onCheckout(product)}
          className="w-full bg-black text-white p-5 font-black text-xl uppercase flex items-center justify-center gap-2 hover:bg-main hover:text-black transition-colors border-t-4 border-black disabled:bg-gray-400 disabled:text-gray-700 disabled:cursor-not-allowed"
        >
          {inStock ? 'Join War' : 'Out of Stock'} <ArrowRight size={24} />
        </button>
      )}
    </motion.div>
  );
}
