// WORKING [ICON CHANGED, POPUP DONE, CHART DONE, DESIGN DONE]
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  useMap,
  Popup,
} from "react-leaflet";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-control-geocoder";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "./Map.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

console.log(L);

// Fix for marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const center = {
  lat: 5.396214,
  lng: 100.327359,
};

// Custom Geocoder component
const GeocoderControl = () => {
  const map = useMap(); // Get the map instance

  useEffect(() => {
    // Check if the geocoder function is available
    if (typeof L.Control.geocoder !== "function") {
      console.error("Geocoder is not available");
      return;
    }

    // Add geocoder to the map
    const geocoder = L.Control.geocoder().addTo(map);

    return () => {
      // Clean up the geocoder when component unmounts
      map.removeControl(geocoder);
    };
  }, [map]);

  return null; // No need to render anything
};

const getPlaceName = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
    );
    return response.data.display_name; // Return the name of the place
  } catch (error) {
    console.error("Error fetching place name:", error);
    return null;
  }
};

const Map = () => {
  const [tenants, setTenants] = useState([]);
  const [placeNames, setPlaceNames] = useState({});

  useEffect(() => {
    document.body.style.background = "none";

    const fetchTenants = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/tenants");
        const data = response.data;
        console.log("Fetched tenants data:", data);

        // Ensure data is an array
        if (!Array.isArray(data)) {
          console.error("Fetched data is not an array:", data);
          return;
        }

        setTenants(data);

        // Fetch place names after tenants are set
        const names = {};
        await Promise.all(
          data.map(async (tenant) => {
            const name = await getPlaceName(tenant.latitude, tenant.longitude);
            names[tenant.IC] = name; 
            console.log(`Fetched place name for tenant ${tenant.IC}:`, name); // Log each fetched name
          })
        );
        setPlaceNames(names);
      } catch (error) {
        console.error("Error fetching tenants:", error);
      }
    };

    fetchTenants();

    return () => {
      document.body.style.background = ""; // Reset background when component unmounts
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="container">
        {/* Map Section */}
        <div className="map-section">
          <MapContainer
            center={center}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {/* Add GeocoderControl to the map */}
            <GeocoderControl />

            {tenants.map((tenant, index) => {
              const position = {
                lat: parseFloat(tenant.latitude),
                lng: parseFloat(tenant.longitude),
              };

              const color =
                tenant.status === "success"
                  ? "green"
                  : tenant.status === "incomplete"
                  ? "orange"
                  : tenant.status === "failed"
                  ? "red"
                  : "#1E90FF";

              if (!isNaN(position.lat) && !isNaN(position.lng)) {
                return (
                  <React.Fragment key={index}>
                    <Circle
                      center={{
                        lat: parseFloat(tenant.latitude),
                        lng: parseFloat(tenant.longitude),
                      }}
                      radius={1000}
                      pathOptions={{ color: color, fillOpacity: 0.35 }}
                    />
                    <Marker
                      position={{
                        lat: parseFloat(tenant.latitude),
                        lng: parseFloat(tenant.longitude),
                      }}
                      icon={
                        new L.Icon({
                          iconUrl: require("leaflet/dist/images/marker-icon.png"),
                          iconSize: [25, 41],
                          iconAnchor: [12, 41],
                          popupAnchor: [1, -34],
                          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
                          shadowSize: [41, 41],
                          className: `marker-${color}`, // Add a class for the color
                        })
                      }
                    >
                      <Popup>
                        {/* Use Popup from react-leaflet here */}
                        <div>
                          <h4>{placeNames[tenant.IC] || "Loading..."}</h4>
                        </div>
                      </Popup>
                    </Marker>
                  </React.Fragment>
                );
              }
              return null; // Skip rendering if position is invalid
            })}
          </MapContainer>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Map;
