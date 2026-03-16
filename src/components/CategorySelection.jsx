import React from 'react';

export default function CategorySelection({ onSelectCategory }) {
  const categories = [
    { id: 'mothers-day', name: "Mother's Day", emoji: '🌸', color: 'from-pink-400 to-rose-400' },
    { id: 'birthday', name: 'Birthday', emoji: '🎈', color: 'from-amber-400 to-orange-400' },
    { id: 'love', name: 'Love & Romance', emoji: '❤️', color: 'from-red-500 to-rose-600' },
    { id: 'celebration', name: 'Celebration', emoji: '✨', color: 'from-yellow-400 to-amber-500' }
  ];

  return (
    <div className="space-y-6 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-left mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose an Occasion</h2>
        <p className="text-gray-500">Select the type of bloom experience you want to create.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-3xl shadow-sm border border-gray-100 active:scale-95 transition-all text-center group hover:shadow-md"
          >
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
              {cat.emoji}
            </div>
            <span className="font-semibold text-gray-800">{cat.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
