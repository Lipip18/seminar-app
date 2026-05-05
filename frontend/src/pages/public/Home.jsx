import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      {/* Hero Section */}
      <h1 className="text-5xl md:text-7xl font-bold mb-6 mt-12 bg-clip-text text-transparent bg-gradient-to-r from-accent to-secondary">
        Seminar Hall Management System
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mb-12">
        Streamline reservations, effortlessly check real-time availability, and coordinate institutional events with our powerful booking platform.
      </p>
      
      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mb-20">
        <Link 
          to="/login" 
          className="px-8 py-3 rounded-xl bg-secondary text-white font-semibold hover:bg-secondary/80 transition-all shadow-[0_0_20px_rgba(79,70,229,0.5)] transform hover:scale-105"
        >
          Login
        </Link>
        <Link 
          to="/register" 
          className="px-8 py-3 rounded-xl border border-white/20 bg-card hover:bg-card/50 text-white font-semibold transition-all backdrop-blur-md transform hover:scale-105"
        >
          Create Account
        </Link>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl mb-20">
        <div className="glass-panel p-8 text-left hover:border-secondary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3">Real-time Booking</h3>
          <p className="text-muted-foreground">Instantly check hall availability to ensure you avoid double bookings and scheduling conflicts.</p>
        </div>
        
        <div className="glass-panel p-8 text-left hover:border-secondary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3">Role Based Access</h3>
          <p className="text-muted-foreground">Tailored dashboards for Admin, Faculty, and Students to ensure an organized workflow and appropriate data access.</p>
        </div>

        <div className="glass-panel p-8 text-left hover:border-secondary/50 transition-colors">
          <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center mb-6">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
          </div>
          <h3 className="text-2xl font-semibold mb-3">Rich Amenities</h3>
          <p className="text-muted-foreground">View high quality photos and extensive amenity lists for every facility in the building.</p>
        </div>
      </div>
    </div>
  );
}
