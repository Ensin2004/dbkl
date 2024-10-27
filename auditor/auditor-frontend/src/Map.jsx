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
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { FaInfoCircle } from "react-icons/fa";
import { FaTimes } from "react-icons/fa";
import "./Map.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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
  const [stats, setStats] = useState({
    success: 0,
    incomplete: 0,
    failed: 0,
    unregistered: 0,
  });

  const totalRequests =
    stats.success + stats.incomplete + stats.failed + stats.unregistered;

  // New state for popup
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState(null);

  // Function to handle info icon click
  const handleInfoClick = (status) => {
    const filteredTenants = tenants.filter((tenant) => {
      // Include tenants that match the status or are unregistered (null/empty status)
      return (
        tenant.status === status ||
        (status === "unregistered" && !tenant.status)
      );
    });
    setPopupData(filteredTenants);
    setPopupVisible(true);
  };

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

        // Count the number of requests by status
        const successCount = data.filter(
          (tenant) => tenant.status === "success"
        ).length;
        const incompleteCount = data.filter(
          (tenant) => tenant.status === "incomplete"
        ).length;
        const failedCount = data.filter(
          (tenant) => tenant.status === "failed"
        ).length;
        const unregisteredCount = data.filter(
          (tenant) => !tenant.status
        ).length;

        setStats({
          success: successCount,
          incomplete: incompleteCount,
          failed: failedCount,
          unregistered: unregisteredCount,
        });

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

  const barChartData = {
    labels: ["Success", "Incomplete", "Failed", "Unregistered"],
    datasets: [
      {
        label: "Request Status",
        data: [
          stats.success,
          stats.incomplete,
          stats.failed,
          stats.unregistered,
        ],
        backgroundColor: ["green", "orange", "red", "#1E90FF"],
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    animation: {
      duration: 1500,
      easing: "easeInOutBounce", // Easing function (e.g., 'linear', 'easeIn', 'easeOut', 'easeInOutBounce')
      loop: false,
    },
    indexAxis: "y",
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0, // Ensure whole numbers are shown
        },
        grid: {
          display: false, // Hide grid lines on the x-axis
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="left-container">
          <h2>
            <center>Requests Overview ({totalRequests})</center>
          </h2>
          {/* Statistics Section */}
          <div className="stats-container">
            <div className="stats">
              <p className="stat-item success">
                <span className="label">Success: </span>
                <span className="count">{stats.success}</span>
                <FaInfoCircle
                  className="info-icon"
                  onClick={() => handleInfoClick("success")}
                />
              </p>
              <p className="stat-item incomplete">
                <span className="label">Incomplete: </span>
                <span className="count">{stats.incomplete}</span>
                <FaInfoCircle
                  className="info-icon"
                  onClick={() => handleInfoClick("incomplete")}
                />
              </p>
              <p className="stat-item failed">
                <span className="label">Failed: </span>
                <span className="count">{stats.failed}</span>
                <FaInfoCircle
                  className="info-icon"
                  onClick={() => handleInfoClick("failed")}
                />
              </p>
              <p className="stat-item unregistered">
                <span className="label">Unregistered: </span>
                <span className="count">{stats.unregistered}</span>
                <FaInfoCircle
                  className="info-icon"
                  onClick={() => handleInfoClick("unregistered")}
                />
              </p>
            </div>
          </div>

          {/* Bar Chart Section */}
          <div className="bar-chart-container">
            <Bar data={barChartData} options={barChartOptions} height={250} />
          </div>
        </div>

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
                        {/* Use Popup from react-leaflet */}
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

        {/* Popup for tenant info */}
        {popupVisible && (
          <div className="popup-overlay">
            <div className="popup-content">
              <h2>
                <center>Tenant Details</center>
              </h2>
              <FaTimes
                className="close-popup"
                onClick={() => setPopupVisible(false)}
              />
              {popupData && popupData.length > 0 ? (
                <ul>
                  {popupData.map((tenant, index) => (
                    <li key={index} style={{ marginBottom: "20px" }}>
                      <div>
                        <strong>IC:</strong> <strong>{tenant.IC}</strong>
                      </div>
                      <div>
                        <strong>Latitude:</strong>{" "}
                        {parseFloat(tenant.latitude).toFixed(4)}
                      </div>
                      <div>
                        <strong>Longitude:</strong>{" "}
                        {parseFloat(tenant.longitude).toFixed(4)}
                      </div>
                      <div>
                        <strong>Location:</strong>{" "}
                        {placeNames[tenant.IC] || "Unknown"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No tenants found for this status.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Map;
