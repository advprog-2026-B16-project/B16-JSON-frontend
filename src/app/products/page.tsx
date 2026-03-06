'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Package, RefreshCw, Globe, Calendar, Boxes } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  originCountry: string;
  purchaseDate: string;
}

export default function ProductsPage() {

  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const fetchProducts = useCallback(async () => {

    setIsLoading(true);
    setError("");

    try {

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);

      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await res.json();

      setProducts(data);

    } catch (err) {

      const errorMessage = err instanceof Error ? err.message : "Error loading products";
      setError(errorMessage);

    } finally {
      setIsLoading(false);
    }

  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-6 py-12">

      {/* Back Button */}
      <motion.button
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        onClick={() => router.back()}
        className="absolute top-8 left-8 flex items-center gap-2 font-bold hover:underline decoration-4 text-black"
      >
        <ArrowLeft size={20}/> Back
      </motion.button>

      <motion.div
        initial={{ y:20, opacity:0 }}
        animate={{ y:0, opacity:1 }}
        className="w-full max-w-4xl"
      >

        <div className="bg-white border-4 border-black p-8 shadow-[12px_12px_0px_0px_#000] text-black">

          {/* Header */}
          <div className="flex items-center justify-between border-b-4 border-black pb-6 mb-6">

            <div className="flex items-center gap-4">

              <div className="bg-yellow-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
                <Package size={36} strokeWidth={2.5}/>
              </div>

              <h1 className="text-4xl font-black uppercase tracking-tight">
                Product Catalog
              </h1>

            </div>

            <button
              onClick={fetchProducts}
              disabled={isLoading}
              className="bg-purple-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
            >
              <RefreshCw size={24} className={isLoading ? "animate-spin" : ""}/>
            </button>

          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-400 border-4 border-black p-4 mb-6 font-bold shadow-[4px_4px_0px_0px_#000]">
              {error}
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center font-bold text-xl">
              Loading products...
            </div>
          )}

          {/* Product List */}
          <div className="grid md:grid-cols-2 gap-6">

            {products.map((product, index) => (

              <motion.div
                key={index}
                initial={{ opacity:0, y:10 }}
                animate={{ opacity:1, y:0 }}
                className="border-4 border-black p-5 bg-cyan-50 shadow-[6px_6px_0px_0px_#000]"
              >

                {/* Name */}
                <h2 className="text-2xl font-black mb-2">
                  {product.name}
                </h2>

                {/* Description */}
                <p className="font-medium mb-4">
                  {product.description}
                </p>

                {/* Price */}
                <div className="text-xl font-bold mb-3">
                  💰 Rp {product.price.toLocaleString()}
                </div>

                {/* Stock */}
                <div className="flex items-center gap-2 font-bold mb-2">
                  <Boxes size={18}/>
                  Stock: {product.stock}
                </div>

                {/* Country */}
                <div className="flex items-center gap-2 font-bold mb-2">
                  <Globe size={18}/>
                  {product.originCountry}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 font-bold">
                  <Calendar size={18}/>
                  {new Date(product.purchaseDate).toLocaleDateString()}
                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </motion.div>

    </div>
  );
}