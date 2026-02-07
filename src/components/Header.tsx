import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  // Check if current path is the blog/news page
  const isBlogPage = location.pathname.startsWith('/blog');

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Adjusted padding: py-2 on mobile, py-4 on desktop */}
        <div className="flex justify-between items-center py-2 md:py-4">
          <NavLink to="/" className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 md:h-6 md:w-6" />
            <div>
              {/* Dynamic Title: Changes to 'News' title only on the blog page */}
              <h1 className="text-20px md:text-2xl font-bold">
                {isBlogPage ? "இளம்பிள்ளை செய்திகள்" : "இளம்பிள்ளை"}
              </h1>
              <div className="text-[10px] md:text-xs">
                <span>Elampillai, Tamil Nadu 637502</span>
              </div>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"}>Home</NavLink>
            <NavLink to="/shops" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"}>Shops</NavLink>
            <NavLink to="/blog" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"}>News</NavLink>
            {/* HIDDEN: Admin Dashboard link removed from UI */}
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-blue-500/30">
            <div className="flex flex-col space-y-4">
              <NavLink to="/" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"} onClick={() => setIsOpen(false)}>Home</NavLink>
              <NavLink to="/shops" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"} onClick={() => setIsOpen(false)}>Shops</NavLink>
              <NavLink to="/blog" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"} onClick={() => setIsOpen(false)}>News</NavLink>
              {/* HIDDEN: Admin Dashboard link removed from UI */}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}