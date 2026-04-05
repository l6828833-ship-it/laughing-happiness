// Categories Page — Quizoi Light Theme
import { Link } from 'wouter';
import { LayoutGrid, ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { fetchCategories, type Category } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="container flex-1 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <LayoutGrid className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl font-bold text-foreground">All Categories</h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={cat.emoji}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-3xl">{cat.emoji}</span>
                  </div>
                </div>
                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">{cat.name}</h3>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{cat.description}</p>
                  <span className="text-xs text-primary font-semibold">{cat.quizCount} quizzes</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
