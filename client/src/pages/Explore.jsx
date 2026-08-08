import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

import { useState } from "react";


// ==========================================
// FIX LEAFLET MARKER ICON
// ==========================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// ==========================================
// ORBIT LOCATIONS
// ==========================================

const locations = [
  {
    id: 1,
    city: "Kolkata",
    country: "India",
    position: [22.5726, 88.3639],
    discussions: 24,
    conversations: 138,
    members: 42,
  },

  {
    id: 2,
    city: "Delhi",
    country: "India",
    position: [28.6139, 77.209],
    discussions: 31,
    conversations: 176,
    members: 58,
  },

  {
    id: 3,
    city: "Mumbai",
    country: "India",
    position: [19.076, 72.8777],
    discussions: 18,
    conversations: 94,
    members: 35,
  },

  {
    id: 4,
    city: "Bengaluru",
    country: "India",
    position: [12.9716, 77.5946],
    discussions: 27,
    conversations: 121,
    members: 49,
  },

  {
    id: 5,
    city: "London",
    country: "United Kingdom",
    position: [51.5074, -0.1278],
    discussions: 42,
    conversations: 214,
    members: 76,
  },

  {
    id: 6,
    city: "New York",
    country: "United States",
    position: [40.7128, -74.006],
    discussions: 56,
    conversations: 291,
    members: 103,
  },

  {
    id: 7,
    city: "Tokyo",
    country: "Japan",
    position: [35.6762, 139.6503],
    discussions: 39,
    conversations: 187,
    members: 71,
  },
];


// ==========================================
// MAP CONTROLLER
// ==========================================

function MapController({ location }) {
  const map = useMap();

  if (location) {
    map.flyTo(location.position, 5, {
      duration: 1.5,
    });
  }

  return null;
}


// ==========================================
// EXPLORE PAGE
// ==========================================

function Explore() {
  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [search, setSearch] = useState("");


  // ==========================================
  // SEARCH
  // ==========================================

  const filteredLocations =
    locations.filter((location) =>
      `${location.city} ${location.country}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );


  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="max-w-7xl mx-auto px-6 pt-12">

        <div className="text-center">

          <p className="text-orange-500 font-semibold tracking-widest text-sm">
            ORBIT EXPLORE
          </p>

          <h1 className="text-5xl font-bold mt-3">
            🌍 Explore the Orbit
          </h1>

          <p className="text-slate-400 mt-4 text-lg">
            Discover conversations and communities
            around the world.
          </p>

        </div>


        {/* ======================================
            SEARCH
        ====================================== */}

        <div className="max-w-xl mx-auto mt-8">

          <input
            type="text"
            placeholder="Search a city or country..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full px-5 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-orange-500"
          />

        </div>

      </div>


      {/* ======================================
          MAP
      ====================================== */}

      <div className="max-w-7xl mx-auto px-6 mt-10">

        <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">

          <MapContainer
            center={[25, 78]}
            zoom={3}
            minZoom={2}
            maxZoom={10}
            scrollWheelZoom={true}
            style={{
              height: "600px",
              width: "100%",
              background: "#020617",
            }}
          >

            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />


            <MapController
              location={selectedLocation}
            />


            {/* =================================
                MARKERS
            ================================= */}

            {filteredLocations.map(
              (location) => (

                <Marker
                  key={location.id}
                  position={location.position}
                  eventHandlers={{
                    click: () => {
                      setSelectedLocation(
                        location
                      );
                    },
                  }}
                >

                  <Popup>

                    <div className="text-slate-900">

                      <strong className="text-lg">
                        {location.city}
                      </strong>

                      <p>
                        {location.country}
                      </p>

                      <p className="mt-2">
                        🎬{" "}
                        {location.discussions}{" "}
                        discussions
                      </p>

                      <p>
                        💬{" "}
                        {location.conversations}{" "}
                        conversations
                      </p>

                      <p>
                        👥{" "}
                        {location.members} members
                      </p>

                    </div>

                  </Popup>

                </Marker>

              )
            )}

          </MapContainer>

        </div>

      </div>


      {/* ======================================
          LOCATION CARDS
      ====================================== */}

      <div className="max-w-7xl mx-auto px-6 py-12">

        <h2 className="text-2xl font-bold mb-6">
          🌐 Orbit Communities
        </h2>


        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

          {filteredLocations.map(
            (location) => (

              <button
                key={location.id}
                onClick={() =>
                  setSelectedLocation(
                    location
                  )
                }
                className="text-left bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-orange-500 hover:-translate-y-1 transition"
              >

                <p className="text-orange-500 text-sm font-semibold">
                  ORBIT LOCATION
                </p>

                <h3 className="text-xl font-bold mt-2">
                  {location.city}
                </h3>

                <p className="text-slate-400 text-sm">
                  {location.country}
                </p>


                <div className="grid grid-cols-3 gap-2 mt-5 text-center">

                  <div>
                    <p className="text-lg font-bold">
                      {location.discussions}
                    </p>

                    <p className="text-xs text-slate-500">
                      Discussions
                    </p>
                  </div>


                  <div>
                    <p className="text-lg font-bold">
                      {location.conversations}
                    </p>

                    <p className="text-xs text-slate-500">
                      Chats
                    </p>
                  </div>


                  <div>
                    <p className="text-lg font-bold">
                      {location.members}
                    </p>

                    <p className="text-xs text-slate-500">
                      Members
                    </p>
                  </div>

                </div>

              </button>

            )
          )}

        </div>

      </div>


      {/* ======================================
          SELECTED LOCATION
      ====================================== */}

      {selectedLocation && (

        <div className="max-w-4xl mx-auto px-6 pb-16">

          <div className="bg-slate-900 border border-orange-500/40 rounded-3xl p-8">

            <div className="flex justify-between items-start">

              <div>

                <p className="text-orange-500 text-sm font-semibold">
                  SELECTED LOCATION
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  📍 {selectedLocation.city}
                </h2>

                <p className="text-slate-400 mt-1">
                  {selectedLocation.country}
                </p>

              </div>


              <button
                onClick={() =>
                  setSelectedLocation(null)
                }
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>

            </div>


            <div className="grid grid-cols-3 gap-4 mt-8">

              <div className="bg-slate-800 rounded-2xl p-5">

                <p className="text-2xl font-bold">
                  {selectedLocation.discussions}
                </p>

                <p className="text-slate-400 text-sm mt-1">
                  Discussions
                </p>

              </div>


              <div className="bg-slate-800 rounded-2xl p-5">

                <p className="text-2xl font-bold">
                  {selectedLocation.conversations}
                </p>

                <p className="text-slate-400 text-sm mt-1">
                  Conversations
                </p>

              </div>


              <div className="bg-slate-800 rounded-2xl p-5">

                <p className="text-2xl font-bold">
                  {selectedLocation.members}
                </p>

                <p className="text-slate-400 text-sm mt-1">
                  Members
                </p>

              </div>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Explore;