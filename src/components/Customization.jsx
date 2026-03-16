import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function Customization({ categoryId, onGenerate, onBack }) {
  const [cardMessage, setCardMessage] = useState('');
  const [flowerType, setFlowerType] = useState('Pink Roses');
  const [balloonColor, setBalloonColor] = useState('Gold');

  const handleSubmit = (e) => {
    e.preventDefault();
    onGenerate({ categoryId, cardMessage, flowerType, balloonColor });
  };

  return (
    <div className="space-y-6 px-4 animate-in fade-in slide-in-from-right-8 duration-500 pb-24">
      <div className="flex items-center space-x-2 mb-8">
        <button onClick={onBack} className="text-gray-400 hover:text-gray-800 transition-colors">
          ← Back
        </button>
      </div>
      
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Customize it</h2>
        <p className="text-gray-500">Make this bloom experience truly personal.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2 text-left">
          <label className="block text-sm font-semibold text-gray-700">Inner Card Message</label>
          <textarea 
            value={cardMessage}
            onChange={(e) => setCardMessage(e.target.value)}
            placeholder="e.g. Happy Birthday Mimi! We love you so much!"
            className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition-all resize-none h-24 shadow-sm"
            required
          />
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-sm font-semibold text-gray-700">Flower Preference</label>
          <select 
            value={flowerType}
            onChange={(e) => setFlowerType(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm bg-white"
          >
            <option>Pink Roses</option>
            <option>Red Roses</option>
            <option>Yellow Roses</option>
            <option>White Orchids</option>
            <option>Mixed Spring Bouquet</option>
          </select>
        </div>

        <div className="space-y-2 text-left">
          <label className="block text-sm font-semibold text-gray-700">Balloon Color (Optional)</label>
          <select 
            value={balloonColor}
            onChange={(e) => setBalloonColor(e.target.value)}
            className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm bg-white"
          >
            <option>None (Flowers Only)</option>
            <option>Gold</option>
            <option>Rose Gold</option>
            <option>Silver</option>
            <option>Pastel Pink</option>
          </select>
        </div>

        <div className="pt-6">
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-lg p-4 rounded-full shadow-lg shadow-amber-200 active:scale-95 transition-all flex justify-center items-center space-x-2 group"
          >
            <Sparkles size={20} className="group-hover:animate-pulse" />
            <span>Generate Bloom</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}
