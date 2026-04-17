'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Package,
  RefreshCw,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  originCountry: string;
  purchaseDate: string;
  jastiperId: string;
}

export default function ProductsPage() {

  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    originCountry: '',
    purchaseDate: '',
    jastiperId: 'user123'
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // FETCH PRODUCTS
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch {
      setError('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // HANDLE FORM CHANGE
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // CREATE / UPDATE
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const url = editingId
        ? `${process.env.NEXT_PUBLIC_API_URL}/products/${editingId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/products`;

      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock)
        })
      });

      if (!res.ok) throw new Error();

      setSuccess(editingId ? 'Product updated!' : 'Product created!');

      setForm({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        originCountry: '',
        purchaseDate: '',
        jastiperId: 'user123'
      });

      setEditingId(null);
      fetchProducts();

    } catch {
      setError('Failed to save product');
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
        method: 'DELETE'
      });
      fetchProducts();
    } catch {
      setError('Delete failed');
    }
  };

  // EDIT
  const handleEdit = (p: Product) => {
    setForm(p);
    setEditingId(p.id!);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 py-12">

      {/* Back */}
      <button
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex gap-2 font-bold"
      >
        <ArrowLeft /> Back
      </button>

      <div className="w-full max-w-5xl">

        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000]">

          {/* HEADER */}
          <div className="flex justify-between mb-6 border-b-4 pb-4">
            <h1 className="text-4xl font-black flex gap-3 items-center">
              <Package /> Products
            </h1>

            <button onClick={fetchProducts}>
              <RefreshCw />
            </button>
          </div>

          {/* ALERT */}
          {error && <div className="bg-red-400 p-3 mb-4">{error}</div>}
          {success && <div className="bg-green-400 p-3 mb-4">{success}</div>}

          {/* FORM */}
          <form onSubmit={handleSubmit} className="grid gap-3 mb-8">

            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="border-4 p-2"/>
            <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required className="border-4 p-2"/>
            <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required className="border-4 p-2"/>
            <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required className="border-4 p-2"/>
            <input name="originCountry" placeholder="Country" value={form.originCountry} onChange={handleChange} required className="border-4 p-2"/>
            <input name="purchaseDate" type="date" value={form.purchaseDate} onChange={handleChange} required className="border-4 p-2"/>

            <button className="bg-green-400 border-4 p-2 font-bold">
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
          </form>

          {/* LIST */}
          <div className="grid md:grid-cols-2 gap-6">

            {products.map((p) => (
              <div key={p.id} className="border-4 p-4 shadow-[6px_6px_0px_0px_#000]">

                <h2 className="text-xl font-black">{p.name}</h2>
                <p>{p.description}</p>
                <p>Rp {p.price}</p>
                <p>Stock: {p.stock}</p>
                <p>{p.originCountry}</p>
                <p>{p.purchaseDate}</p>

                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(p)} className="bg-yellow-300 border-2 p-1">
                    <Pencil size={16}/>
                  </button>
                  <button onClick={() => handleDelete(p.id!)} className="bg-red-400 border-2 p-1">
                    <Trash2 size={16}/>
                  </button>
                </div>

              </div>
            ))}

          </div>

        </div>

      </div>
    </div>
  );
}