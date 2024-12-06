import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X, MapPin } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <NavLink to="/" className="flex items-center space-x-2">
            <MapPin className="h-6 w-6" />
            <div>
              <h1 className="text-2xl font-bold">இளம்பிள்ளை</h1>
              <div className="text-xs">
                <span>Elampillai, Tamil Nadu 637502</span>
              </div>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <NavLink to="/" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"}>Home</NavLink>
            <NavLink to="/shops" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"}>Shops</NavLink>
            <NavLink to="/blog" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"}>News</NavLink>
            <NavLink to="/marketplace" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"}>Marketplace</NavLink>
            <NavLink to="/admin-dashboard" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"}>Admin Dashboard</NavLink>
          </nav>

          {/* Mobile menu button */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <NavLink to="/" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"} onClick={() => setIsOpen(false)}>Home</NavLink>
              <NavLink to="/shops" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"} onClick={() => setIsOpen(false)}>Shops</NavLink>
              <NavLink to="/blog" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"} onClick={() => setIsOpen(false)}>News</NavLink>
              <NavLink to="/marketplace" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"} onClick={() => setIsOpen(false)}>Marketplace</NavLink>
              <NavLink to="/admin-dashboard" className={({isActive}) => isActive ? "text-yellow-200" : "hover:text-yellow-200 transition"} onClick={() => setIsOpen(false)}>Admin Dashboard</NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}