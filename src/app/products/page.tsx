'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

import {
  ArrowLeft,
  Package,
  Search,
  RefreshCw,
  User,
  Globe,
  Boxes,
  Calendar
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

  const [searchName, setSearchName] = useState('');
  const [searchJastiper, setSearchJastiper] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  // FETCH ALL PRODUCTS
  const fetchProducts = useCallback(async () => {

    setIsLoading(true);
    setError('');

    try {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`
      );

      if (!res.ok) {
        throw new Error();
      }

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

  // SEARCH BY PRODUCT NAME
  const handleSearchName = async () => {

    if (!searchName) {
      fetchProducts();
      return;
    }

    setIsLoading(true);
    setError('');

    try {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/search?name=${searchName}`
      );

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setProducts(data);

    } catch {
      setError('Failed to search products');
    } finally {
      setIsLoading(false);
    }
  };

  // SEARCH BY JASTIPER
  const handleSearchJastiper = async () => {

    if (!searchJastiper) {
      fetchProducts();
      return;
    }

    setIsLoading(true);
    setError('');

    try {

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/jastiper/${searchJastiper}`
      );

      if (!res.ok) {
        throw new Error();
      }

      const data = await res.json();

      setProducts(data);

    } catch {
      setError('Failed to search jastiper products');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 py-12">

      {/* BACK BUTTON */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 font-bold hover:underline"
      >
        <ArrowLeft size={20}/>
        Back
      </motion.button>

      <motion.div
        initial={{ y:20, opacity:0 }}
        animate={{ y:0, opacity:1 }}
        className="w-full max-w-6xl"
      >

        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000]">

          {/* HEADER */}
          <div className="flex justify-between items-center border-b-4 border-black pb-6 mb-6">

            <div className="flex items-center gap-4">

              <div className="bg-yellow-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
                <Package size={36}/>
              </div>

              <h1 className="text-4xl font-black uppercase">
                Product Catalog
              </h1>

            </div>

            <button
              onClick={fetchProducts}
              className="bg-purple-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]"
            >
              <RefreshCw size={24}/>
            </button>

          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-400 border-4 border-black p-4 mb-6 font-bold">
              {error}
            </div>
          )}

          {/* SEARCH SECTION */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">

            {/* SEARCH PRODUCT */}
            <div className="border-4 border-black p-4 bg-cyan-100 shadow-[6px_6px_0px_0px_#000]">

              <h2 className="text-2xl font-black mb-4 flex gap-2 items-center">
                <Search />
                Search Product
              </h2>

              <div className="flex gap-2">

                <input
                  type="text"
                  placeholder="Search by product name..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="flex-1 border-4 border-black p-2 font-bold"
                />

                <button
                  onClick={handleSearchName}
                  className="bg-green-300 border-4 border-black px-4 font-black"
                >
                  Search
                </button>

              </div>

            </div>

            {/* SEARCH JASTIPER */}
            <div className="border-4 border-black p-4 bg-pink-100 shadow-[6px_6px_0px_0px_#000]">

              <h2 className="text-2xl font-black mb-4 flex gap-2 items-center">
                <User />
                Search Jastiper
              </h2>

              <div className="flex gap-2">

                <input
                  type="text"
                  placeholder="Enter jastiper id..."
                  value={searchJastiper}
                  onChange={(e) => setSearchJastiper(e.target.value)}
                  className="flex-1 border-4 border-black p-2 font-bold"
                />

                <button
                  onClick={handleSearchJastiper}
                  className="bg-yellow-300 border-4 border-black px-4 font-black"
                >
                  Search
                </button>

              </div>

            </div>

          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="text-center text-2xl font-black">
              Loading...
            </div>
          )}

          {/* PRODUCT LIST */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {products.map((product) => (

              <motion.div
                key={product.id}
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                className="border-4 border-black p-5 bg-cyan-50 shadow-[6px_6px_0px_0px_#000]"
              >

                {/* PRODUCT NAME */}
                <h2 className="text-2xl font-black mb-2">
                  {product.name}
                </h2>

                {/* DESCRIPTION */}
                <p className="mb-4 font-medium">
                  {product.description}
                </p>

                {/* PRICE */}
                <div className="text-xl font-black mb-3">
                  💰 Rp {product.price.toLocaleString()}
                </div>

                {/* STOCK */}
                <div className="flex gap-2 items-center font-bold mb-2">
                  <Boxes size={18}/>
                  Stock: {product.stock}
                </div>

                {/* COUNTRY */}
                <div className="flex gap-2 items-center font-bold mb-2">
                  <Globe size={18}/>
                  {product.originCountry}
                </div>

                {/* DATE */}
                <div className="flex gap-2 items-center font-bold mb-2">
                  <Calendar size={18}/>
                  {new Date(product.purchaseDate).toLocaleDateString()}
                </div>

                {/* JASTIPER */}
                <div className="flex gap-2 items-center font-bold">
                  <User size={18}/>
                  {product.jastiperId}
                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </motion.div>

    </div>
  );
}