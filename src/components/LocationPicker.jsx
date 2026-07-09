import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Navigation, Clock, ChevronRight,
  ArrowLeft, X, Check, AlertCircle, Loader2
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ─── Fix Leaflet default icon paths (Vite asset hashing breaks them) ───────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const RECENT_KEY = '3dish_recent_locations';
const MAX_RECENT = 3;

// ─── Utilities ────────────────────────────────────────────────────────────────
const loadRecent = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
};
const saveRecent = (entry) => {
  try {
    const existing = loadRecent().filter(r => r.address !== entry.address);
    const updated = [entry, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {}
};

// Nominatim search (free, no API key)
const nominatimSearch = async (query) => {
  if (!query || query.length < 3) return [];
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=6&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': '3Dish-App/1.0' } }
    );
    return await res.json();
  } catch { return []; }
};

// Nominatim reverse geocode
const reverseGeocode = async (lat, lng) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en', 'User-Agent': '3Dish-App/1.0' } }
    );
    const data = await res.json();
    return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
};

// Format a Nominatim result into a short display name
const formatResult = (r) => {
  const a = r.address || {};
  const parts = [
    a.road || a.pedestrian || a.footway,
    a.suburb || a.neighbourhood || a.village || a.town,
    a.city || a.county,
    a.state,
    a.country,
  ].filter(Boolean);
  return parts.length >= 2 ? parts.slice(0, 3).join(', ') : r.display_name;
};


// ═══════════════════════════════════════════════════════════════════════════════
// MAP VIEW — shows Leaflet map with fixed center pin
// ═══════════════════════════════════════════════════════════════════════════════
function MapView({ initialCoords, initialAddress, onBack, onConfirm }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [address, setAddress] = useState(initialAddress || '');
  const [coords, setCoords] = useState(initialCoords || { lat: 20.5937, lng: 78.9629 }); // India default
  const [addressDetails, setAddressDetails] = useState('');
  const [isReversing, setIsReversing] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const debounceRef = useRef(null);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [coords.lat, coords.lng],
      zoom: 16,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Small attribution bottom-left
    L.control.attribution({ position: 'bottomleft', prefix: '' })
      .addAttribution('© <a href="https://openstreetmap.org">OpenStreetMap</a>')
      .addTo(map);

    mapRef.current = map;

    // Reverse geocode whenever map stops moving
    map.on('moveend', () => {
      const center = map.getCenter();
      const newCoords = { lat: center.lat, lng: center.lng };
      setCoords(newCoords);

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setIsReversing(true);
        const addr = await reverseGeocode(newCoords.lat, newCoords.lng);
        setAddress(addr);
        setIsReversing(false);
      }, 600);
    });

    return () => {
      clearTimeout(debounceRef.current);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const handleGpsSnap = () => {
    if (!navigator.geolocation) return;
    setIsGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: c }) => {
        const lat = c.latitude, lng = c.longitude;
        mapRef.current?.flyTo([lat, lng], 17, { duration: 1 });
        setCoords({ lat, lng });
        setIsReversing(true);
        const addr = await reverseGeocode(lat, lng);
        setAddress(addr);
        setIsReversing(false);
        setIsGpsLoading(false);
      },
      () => setIsGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleConfirm = () => {
    const finalAddress = addressDetails
      ? `${addressDetails}, ${address}`
      : address;
    saveRecent({ address: finalAddress, lat: coords.lat, lng: coords.lng });
    onConfirm({ address: finalAddress, coords });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#12141D]">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 dark:hover:bg-white/20 transition-colors"
        >
          <ArrowLeft size={18} className="text-neutral-700 dark:text-white" />
        </button>
        <div>
          <h2 className="font-display font-black text-base text-neutral-900 dark:text-white">Select delivery location</h2>
          <p className="text-[10px] text-neutral-400">Drag map to adjust pin</p>
        </div>
      </div>

      {/* Map — takes up top 55% */}
      <div className="relative shrink-0" style={{ height: '55%' }}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Fixed center pin */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[1000]">
          <div className="flex flex-col items-center" style={{ marginTop: '-28px' }}>
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
              <MapPin size={18} className="text-white" fill="white" />
            </div>
            <div className="w-3 h-3 bg-red-500 rotate-45 -mt-1.5 shadow-sm" />
            <div className="w-2 h-2 bg-black/20 rounded-full blur-sm -mt-0.5 scale-75" />
          </div>
        </div>

        {/* GPS snap button on map */}
        <button
          onClick={handleGpsSnap}
          disabled={isGpsLoading}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e2030] text-neutral-800 dark:text-white text-xs font-black rounded-full shadow-lg border border-neutral-200 dark:border-white/10 hover:bg-neutral-50 transition-colors disabled:opacity-60"
        >
          {isGpsLoading
            ? <Loader2 size={13} className="animate-spin text-red-500" />
            : <Navigation size={13} className="text-red-500" />}
          Use current location
        </button>
      </div>

      {/* Bottom sheet */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#12141D] px-4 pt-4 pb-6 flex flex-col gap-4">
        {/* Detected address */}
        <div className="bg-neutral-50 dark:bg-white/5 rounded-2xl p-3.5 flex items-start gap-3 border border-neutral-200 dark:border-white/8">
          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-0.5">
            <MapPin size={14} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wider mb-0.5">Delivery Address</p>
            {isReversing
              ? <div className="flex items-center gap-2 text-sm text-neutral-500">
                  <Loader2 size={13} className="animate-spin" />
                  <span>Locating address…</span>
                </div>
              : <p className="text-sm font-bold text-neutral-800 dark:text-white leading-snug">{address || 'Move the map to select'}</p>
            }
          </div>
        </div>

        {/* Address details (flat, floor, landmark) */}
        <div>
          <label className="block text-xs font-black text-neutral-500 uppercase tracking-wider mb-2">Address Details</label>
          <input
            type="text"
            value={addressDetails}
            onChange={e => setAddressDetails(e.target.value)}
            placeholder="Flat / Floor / Building / Landmark"
            className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-xl p-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37] placeholder:text-neutral-400 transition-colors"
          />
          <p className="text-[10px] text-neutral-400 mt-1.5">E.g. Flat 4B, 3rd Floor, near SBI Bank</p>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!address || isReversing}
          className="mt-auto w-full py-4 rounded-2xl bg-[#D4AF37] text-black font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Check size={18} strokeWidth={3} />
          Confirm Location
        </button>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// SEARCH VIEW — search bar + GPS row + recent locations
// ═══════════════════════════════════════════════════════════════════════════════
function SearchView({ onClose, onLocationConfirmed }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [gpsAddress, setGpsAddress] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [recentLocations, setRecentLocations] = useState([]);
  const [mapTarget, setMapTarget] = useState(null); // { lat, lng, address } → triggers map view
  const searchDebounce = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setRecentLocations(loadRecent());
    inputRef.current?.focus();
    // Quietly attempt GPS on mount so "Use current location" row is pre-populated
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async ({ coords: c }) => {
          const lat = c.latitude, lng = c.longitude;
          setGpsCoords({ lat, lng });
          const addr = await reverseGeocode(lat, lng);
          setGpsAddress(addr);
        },
        () => {},
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    }
  }, []);

  // Debounced Nominatim search
  useEffect(() => {
    clearTimeout(searchDebounce.current);
    if (query.length < 3) { setResults([]); return; }
    setIsSearching(true);
    searchDebounce.current = setTimeout(async () => {
      const data = await nominatimSearch(query);
      setResults(data);
      setIsSearching(false);
    }, 500);
    return () => clearTimeout(searchDebounce.current);
  }, [query]);

  const handleGpsUse = () => {
    if (gpsCoords) {
      // GPS already fetched — go straight to map view at that position
      setMapTarget({ ...gpsCoords, address: gpsAddress });
      return;
    }
    setIsGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: c }) => {
        const lat = c.latitude, lng = c.longitude;
        setGpsCoords({ lat, lng });
        const addr = await reverseGeocode(lat, lng);
        setGpsAddress(addr);
        setIsGpsLoading(false);
        setMapTarget({ lat, lng, address: addr });
      },
      (err) => {
        setIsGpsLoading(false);
        if (err.code === 1) setGpsError('Permission denied. Allow location in browser settings.');
        else setGpsError('Could not detect location. Please search manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResultSelect = (r) => {
    setMapTarget({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      address: formatResult(r),
    });
  };

  const handleRecentSelect = (r) => {
    setMapTarget({ lat: r.lat, lng: r.lng, address: r.address });
  };

  // Map view shown when user picks a result
  if (mapTarget) {
    return (
      <MapView
        initialCoords={{ lat: mapTarget.lat, lng: mapTarget.lng }}
        initialAddress={mapTarget.address}
        onBack={() => setMapTarget(null)}
        onConfirm={({ address, coords }) => {
          onLocationConfirmed({ address, coords });
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3 border-b border-neutral-200 dark:border-white/10 bg-white dark:bg-[#12141D]">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 transition-colors"
          >
            <X size={18} className="text-neutral-700 dark:text-white" />
          </button>
          <h2 className="font-display font-black text-base text-neutral-900 dark:text-white">Select delivery location</h2>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for area, street name..."
            className="w-full bg-neutral-50 dark:bg-[#0a0a0a] border border-neutral-200 dark:border-white/10 rounded-2xl pl-9 pr-10 py-3 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-[#D4AF37] placeholder:text-neutral-400 transition-colors"
          />
          {(isSearching) && (
            <Loader2 size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 animate-spin" />
          )}
          {query && !isSearching && (
            <button
              onClick={() => { setQuery(''); setResults([]); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {/* Search results */}
        {results.length > 0 && (
          <div>
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => handleResultSelect(r)}
                className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-white/5 border-b border-neutral-100 dark:border-white/5 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-white/8 flex items-center justify-center shrink-0">
                  <MapPin size={15} className="text-neutral-500 dark:text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-neutral-800 dark:text-white truncate">{formatResult(r)}</p>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">{r.display_name}</p>
                </div>
                <ChevronRight size={14} className="text-neutral-400 shrink-0" />
              </button>
            ))}
          </div>
        )}

        {/* No-results nudge */}
        {query.length >= 3 && results.length === 0 && !isSearching && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <AlertCircle size={28} className="mb-2 opacity-40" />
            <p className="text-sm font-bold">No results found</p>
            <p className="text-xs mt-1">Try a different area or street name</p>
          </div>
        )}

        {/* Default (no active search) — GPS row + recent */}
        {query.length < 3 && (
          <>
            {/* Use Current Location row */}
            <button
              onClick={handleGpsUse}
              disabled={isGpsLoading}
              className="w-full text-left flex items-center gap-3 px-4 py-4 border-b border-neutral-100 dark:border-white/5 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                {isGpsLoading
                  ? <Loader2 size={16} className="animate-spin text-red-500" />
                  : <Navigation size={16} className="text-red-500" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-red-500">Use current location</p>
                {gpsAddress
                  ? <p className="text-xs text-neutral-400 truncate mt-0.5">{gpsAddress}</p>
                  : gpsError
                  ? <p className="text-xs text-red-400 mt-0.5">{gpsError}</p>
                  : <p className="text-xs text-neutral-400 mt-0.5">Detecting…</p>
                }
              </div>
              <ChevronRight size={14} className="text-red-400 shrink-0" />
            </button>

            {/* Recent locations */}
            {recentLocations.length > 0 && (
              <div>
                <p className="px-4 pt-4 pb-2 text-[10px] font-black text-neutral-400 uppercase tracking-widest">Recent Locations</p>
                {recentLocations.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => handleRecentSelect(r)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 dark:hover:bg-white/5 border-b border-neutral-100 dark:border-white/5 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-white/8 flex items-center justify-center shrink-0">
                      <Clock size={15} className="text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-neutral-800 dark:text-white truncate">{r.address}</p>
                    </div>
                    <ChevronRight size={14} className="text-neutral-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Powered by OpenStreetMap */}
      <div className="shrink-0 py-3 text-center text-[10px] text-neutral-400 border-t border-neutral-100 dark:border-white/5">
        Powered by <a href="https://openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// LOCATION PICKER — main export (full-screen bottom-sheet overlay)
// ═══════════════════════════════════════════════════════════════════════════════
export default function LocationPicker({ isOpen, onClose, onLocationConfirmed }) {
  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleConfirmed = (data) => {
    onLocationConfirmed(data);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={e => e.stopPropagation()}
            className="w-full sm:max-w-lg bg-white dark:bg-[#12141D] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            style={{ height: '92dvh' }}
          >
            <SearchView
              onClose={onClose}
              onLocationConfirmed={handleConfirmed}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
