'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Package, ShoppingCart, Tag, Pencil, Trash2, Loader2, AlertCircle, X } from 'lucide-react';
import { ProductDTO, ProductRequest, ProfileResponseDTO } from '@/types/api';
import { createProduct, deleteProduct, getProducts, updateProduct } from '@/services/products/product.service';
import { getProfile } from '../settings/actions';
import { formatDollar } from '@/lib/currency';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  stock: '',
  originCountry: '',
  purchaseDate: '',
};

type ProductFormState = typeof EMPTY_FORM;

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function CataloguePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponseDTO | null>(null);
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function loadCatalogue() {
      try {
        const [profileResult, productResult] = await Promise.all([getProfile(), getProducts()]);
        if (profileResult.success === true) {
          setProfile(profileResult.data);
        } else {
          setMessage({ type: 'error', text: profileResult.error || 'Failed to load profile' });
        }
        setProducts(productResult);
      } catch (err) {
        setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load catalogue' });
      } finally {
        setIsLoading(false);
      }
    }

    loadCatalogue();
  }, []);

  const ownProducts = useMemo(() => {
    if (!profile?.id) return [];
    return products.filter((product) => product.jastiperId === profile.id);
  }, [products, profile?.id]);

  const activeProducts = ownProducts.filter((product) => product.stock > 0);
  const totalStock = ownProducts.reduce((sum, product) => sum + product.stock, 0);
  const canManageCatalogue = profile?.role?.toUpperCase().includes('JASTIPER') ?? false;
  const todayDate = getTodayDateInputValue();

  function openCreateForm() {
    if (!canManageCatalogue) return;
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
    setMessage(null);
  }

  function openEditForm(product: ProductDTO) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      originCountry: product.originCountry,
      purchaseDate: product.purchaseDate,
    });
    setIsFormOpen(true);
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageCatalogue) {
      setMessage({ type: 'error', text: 'Only verified Jastipers can manage catalogue items' });
      return;
    }

    if (!profile?.id) {
      setMessage({ type: 'error', text: 'Profile not loaded yet' });
      return;
    }

    const payload: ProductRequest = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      originCountry: form.originCountry.trim(),
      purchaseDate: form.purchaseDate,
      jastiperId: profile.id,
    };

    if (!payload.name || !payload.description || !payload.originCountry || !payload.purchaseDate) {
      setMessage({ type: 'error', text: 'Please complete all required fields' });
      return;
    }

    if (payload.purchaseDate < todayDate) {
      setMessage({ type: 'error', text: 'Purchase / return date cannot be before today' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      const savedProduct = editingProduct
        ? await updateProduct(editingProduct.id, payload)
        : await createProduct(payload);

      setProducts((current) => {
        if (editingProduct) {
          return current.map((product) => (product.id === savedProduct.id ? savedProduct : product));
        }
        return [savedProduct, ...current];
      });
      setIsFormOpen(false);
      setEditingProduct(null);
      setForm(EMPTY_FORM);
      setMessage({ type: 'success', text: editingProduct ? 'Product updated' : 'Product created' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save product' });
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(productId: string) {
    setMessage(null);
    try {
      await deleteProduct(productId);
      setProducts((current) => current.filter((product) => product.id !== productId));
      setMessage({ type: 'success', text: 'Product deleted' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to delete product' });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-6xl font-black uppercase mb-4 text-yellow-600">Your Catalogue</h1>
          <p className="text-xl font-bold border-l-8 border-yellow-400 pl-4 bg-yellow-50 py-2">
            Verified Jastipers manage pre-order stock, origin, and war quotas here.
          </p>
        </div>
        <button
          onClick={canManageCatalogue ? openCreateForm : () => router.push('/dashboard/account/jastiper-upgrade')}
          className="neo-button flex items-center gap-2 text-xl bg-yellow-400 text-black"
        >
          <Plus size={24} strokeWidth={3} /> Add New Item
        </button>
      </div>

      {message && (
        <div className={`border-4 border-black p-5 mb-10 flex items-center gap-3 font-black shadow-[6px_6px_0px_0px_#000] ${message.type === 'success' ? 'bg-green-300' : 'bg-red-100'}`}>
          {message.type === 'error' && <AlertCircle size={24} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <MetricCard icon={<Package className="mb-4 text-black" size={32} />} title="Total Items" value={ownProducts.length.toString()} color="bg-cyan-100" />
        <MetricCard icon={<ShoppingCart className="mb-4 text-black" size={32} />} title="Total Stock" value={totalStock.toString()} color="bg-pink-100" />
        <MetricCard icon={<Tag className="mb-4 text-black" size={32} />} title="War-Ready Items" value={activeProducts.length.toString()} color="bg-green-100" />
      </div>

      {!isLoading && !canManageCatalogue && (
        <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] p-10 mb-12">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase text-yellow-600 mb-2">Jastiper verification required</p>
            <h2 className="text-4xl font-black uppercase mb-4">Catalogue opens after KYC approval</h2>
            <p className="font-bold text-lg text-gray-700 mb-6">
              Titipers can browse and join war sessions immediately. To sell items, submit your Jastiper verification so Admin can approve your traveler profile first.
            </p>
            <button
              onClick={() => router.push('/dashboard/account/jastiper-upgrade')}
              className="bg-black text-white border-4 border-black px-8 py-4 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-yellow-400 hover:text-black transition-colors"
            >
              Verify Jastiper Account
            </button>
          </div>
        </div>
      )}

      {isFormOpen && canManageCatalogue && (
        <form onSubmit={handleSubmit} className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] p-6 mb-12">
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="text-3xl font-black uppercase">{editingProduct ? 'Edit Item' : 'New Item'}</h2>
            <button type="button" onClick={() => setIsFormOpen(false)} className="border-4 border-black p-2 hover:bg-red-300">
              <X size={22} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} />
            <Field label="Origin Country" value={form.originCountry} onChange={(value) => setForm({ ...form, originCountry: value })} />
            <Field label="Price" type="number" value={form.price} onChange={(value) => setForm({ ...form, price: value })} />
            <Field label="Stock / Quota" type="number" value={form.stock} onChange={(value) => setForm({ ...form, stock: value })} />
            <Field label="Purchase / Return Date" type="date" min={todayDate} value={form.purchaseDate} onChange={(value) => setForm({ ...form, purchaseDate: value })} />
            <label className="md:col-span-2">
              <span className="block text-xs font-black uppercase text-gray-500 mb-1">Description</span>
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                rows={3}
                className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_#000]"
              />
            </label>
          </div>

          <button disabled={isSaving} className="mt-6 bg-black text-white border-4 border-black px-8 py-3 font-black uppercase flex items-center gap-2 disabled:opacity-60">
            {isSaving && <Loader2 className="animate-spin" size={20} />}
            {editingProduct ? 'Save Changes' : 'Create Product'}
          </button>
        </form>
      )}

      <div className="bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-x-auto">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center gap-4 font-black text-2xl">
            <Loader2 className="animate-spin" /> Loading catalogue...
          </div>
        ) : !canManageCatalogue ? (
          <div className="p-12 text-center">
            <p className="text-3xl font-black uppercase">Buyer account detected</p>
            <p className="font-bold text-gray-600 mt-2">Complete Jastiper verification to create and manage catalogue items.</p>
          </div>
        ) : ownProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-3xl font-black uppercase">No catalogue items yet</p>
            <p className="font-bold text-gray-600 mt-2">Add your first jastip product to make it visible in Marketplace.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-yellow-400 text-black border-b-4 border-black">
                <th className="p-4 font-black uppercase">Product</th>
                <th className="p-4 font-black uppercase">Price</th>
                <th className="p-4 font-black uppercase">Stock</th>
                <th className="p-4 font-black uppercase">Origin</th>
                <th className="p-4 font-black uppercase">Date</th>
                <th className="p-4 font-black uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-black">
              {ownProducts.map((item) => (
                <tr key={item.id} className="hover:bg-yellow-50 transition-colors">
                  <td className="p-4">
                    <p className="font-black">{item.name}</p>
                    <p className="font-bold text-sm text-gray-600 line-clamp-2">{item.description}</p>
                  </td>
                  <td className="max-w-[160px] p-4 font-bold">
                    <span className="block truncate" title={formatDollar(item.price)}>{formatDollar(item.price)}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 border-2 border-black font-black uppercase text-xs ${item.stock > 0 ? 'bg-green-400' : 'bg-gray-300'} shadow-[2px_2px_0px_0px_#000] text-black`}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="p-4 font-bold">{item.originCountry}</td>
                  <td className="p-4 font-bold">{item.purchaseDate}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button onClick={() => openEditForm(item)} className="bg-black text-white px-4 py-2 font-black uppercase text-xs hover:bg-yellow-400 hover:text-black transition-colors border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="bg-red-300 text-black px-4 py-2 font-black uppercase text-xs hover:bg-red-400 transition-colors border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) {
  return (
    <div className={`p-6 border-4 border-black ${color} shadow-[8px_8px_0px_0px_#000]`}>
      {icon}
      <h3 className="text-xl font-black uppercase">{title}</h3>
      <p className="text-4xl font-black">{value}</p>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', min }: { label: string; value: string; onChange: (value: string) => void; type?: string; min?: string }) {
  return (
    <label>
      <span className="block text-xs font-black uppercase text-gray-500 mb-1">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-white border-4 border-black p-4 font-bold focus:outline-none focus:bg-yellow-50 shadow-[4px_4px_0px_0px_#000]"
      />
    </label>
  );
}
