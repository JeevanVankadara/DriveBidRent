import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminServices.getAnalytics();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Failed to load analytics");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message" style={{ textAlign: "center", color: "#c62828", marginTop: "2rem" }}>{error}</div>;

  return (
    <>
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#ff6b00", textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem" }}>
          Analytics
        </h1>

        <div className="analytics-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginTop: "2rem" }}>
          <div className="analytics-card" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <h2 style={{ color: "#ff6b00" }}>Total Users</h2>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{data.totalUsers.toLocaleString()}</p>
          </div>
          <div className="analytics-card" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <h2 style={{ color: "#ff6b00" }}>Total Cars Rented</h2>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{data.totalCarsRented.toLocaleString()}</p>
          </div>
          <div className="analytics-card" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <h2 style={{ color: "#ff6b00" }}>Auction Listings</h2>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{data.totalAuctionListings.toLocaleString()}</p>
          </div>
        </div>

        <div className="performance-table" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", marginTop: "2rem" }}>
          <h2 style={{ color: "#ff6b00", fontSize: "1.5rem", marginBottom: "1.5rem" }}>Vehicle Sales Performance</h2>
          {data.vehiclePerformance.length > 0 ? (
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr style={{ backgroundColor: "#f9f9f9" }}>
                  <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Car</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Starting Price</th>
                  <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "1px solid #ddd" }}>Final Sale Price</th>
                </tr>
              </thead>
              <tbody>
                {data.vehiclePerformance.map((perf, i) => (
                  <tr key={i}>
                    <td style={{ padding: "0.75rem", borderBottom: i === data.vehiclePerformance.length - 1 ? "none" : "1px solid #ddd" }}>
                      {perf.vehicleName || "Unknown"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: i === data.vehiclePerformance.length - 1 ? "none" : "1px solid #ddd" }}>
                      {perf.startingPrice != null ? `₹${perf.startingPrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A"}
                    </td>
                    <td style={{ padding: "0.75rem", borderBottom: i === data.vehiclePerformance.length - 1 ? "none" : "1px solid #ddd" }}>
                      {perf.finalSalePrice != null ? `₹${perf.finalSalePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No vehicle sales data available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Analytics;