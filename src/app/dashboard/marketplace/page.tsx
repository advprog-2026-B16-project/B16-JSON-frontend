'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  ArrowRight,
  Plus
} from 'lucide-react';

interface MarketplaceItem {
  id: number;
  title: string;
  origin: string;
  price: string;
  category: string;
  color: string;
  requester: string;
}

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', 'Electronics', 'Fashion', 'Food & Snacks', 'Beauty', 'Collectibles'];
  const [activeCategory, setActiveCategory] = useState('All');

  const marketplaceItems = [
    {
      id: 1,
      title: 'iPhone 15 Pro Max',
      origin: 'Tokyo, Japan',
      price: 'Rp 21.000.000',
      category: 'Electronics',
      color: 'bg-cyan-300',
      requester: 'Budi S.'
    },
    {
      id: 2,
      title: 'Matcha Powder (Uji)',
      origin: 'Kyoto, Japan',
      price: 'Rp 450.000',
      category: 'Food & Snacks',
      color: 'bg-green-400',
      requester: 'Siti A.'
    },
    {
      id: 3,
      title: 'Vintage Adidas Jacket',
      origin: 'Berlin, Germany',
      price: 'Rp 1.200.000',
      category: 'Fashion',
      color: 'bg-pink-300',
      requester: 'Andi R.'
    },
    {
      id: 4,
      title: 'Labubu Vinyl Figure',
      origin: 'Bangkok, Thailand',
      price: 'Rp 850.000',
      category: 'Collectibles',
      color: 'bg-yellow-400',
      requester: 'Dewi K.'
    },
    {
      id: 5,
      title: 'SK-II Facial Treatment',
      origin: 'Seoul, South Korea',
      price: 'Rp 2.800.000',
      category: 'Beauty',
      color: 'bg-purple-300',
      requester: 'Lina M.'
    },
    {
      id: 6,
      title: 'Limited Edition Oreo',
      origin: 'New York, USA',
      price: 'Rp 150.000',
      category: 'Food & Snacks',
      color: 'bg-orange-300',
      requester: 'Bambang G.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h1 className="text-6xl font-black uppercase mb-4">Marketplace</h1>
          <p className="text-xl font-bold border-l-8 border-black pl-4">Discover what people are looking for around the globe.</p>
        </div>
        <button className="neo-button flex items-center gap-2 text-xl bg-main">
          <Plus size={24} strokeWidth={3} /> Post a Request
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={24} />
          <input 
            type="text"
            placeholder="Search items, locations, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-4 border-black p-4 pl-14 font-bold text-xl shadow-[8px_8px_0px_0px_#000] focus:outline-none focus:translate-x-1 focus:translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 font-black uppercase whitespace-nowrap border-4 border-black transition-all ${activeCategory === cat ? 'bg-black text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-[4px_4px_0px_0px_#000] hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {marketplaceItems.map((item) => (
          <MarketplaceCard key={item.id} item={item} />
        ))}
      </div>

      {/* Empty State / Load More */}
      <div className="mt-16 text-center">
        <button className="border-4 border-black bg-white py-4 px-12 text-2xl font-black shadow-[8px_8px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all">
          Load More Requests
        </button>
      </div>
    </div>
  );
}

function MarketplaceCard({ item }: { item: MarketplaceItem }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`border-4 border-black ${item.color} shadow-[12px_12px_0px_0px_#000] flex flex-col h-full`}
    >
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="bg-white border-2 border-black px-3 py-1 font-black text-xs uppercase shadow-[2px_2px_0px_0px_#000]">
            {item.category}
          </div>
          <div className="flex items-center gap-1 font-bold text-sm">
            <MapPin size={16} /> {item.origin}
          </div>
        </div>

        <h3 className="text-3xl font-black mb-2 uppercase leading-none">{item.title}</h3>
        
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-full border-2 border-black bg-white flex items-center justify-center font-black text-xs">
            {item.requester[0]}
          </div>
          <span className="font-bold text-sm italic">Requested by {item.requester}</span>
        </div>

        <div className="bg-white border-4 border-black p-4 mb-4 shadow-[4px_4px_0px_0px_#000]">
          <p className="text-xs font-black uppercase text-gray-500 mb-1">Budget / Price</p>
          <p className="text-2xl font-black">{item.price}</p>
        </div>
      </div>

      <button className="w-full bg-black text-white p-5 font-black text-xl uppercase flex items-center justify-center gap-2 hover:bg-main hover:text-black transition-colors border-t-4 border-black">
        Offer to Help <ArrowRight size={24} />
      </button>
    </motion.div>
  );
}
