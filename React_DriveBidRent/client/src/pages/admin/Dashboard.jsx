import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminServices.getDashboard();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Failed to load dashboard");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <>
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#ff6b00", textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem" }}>
          Admin Dashboard
        </h1>

        <div className="overview-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
          {[
            { label: "Total Users", value: data.totalUsers },
            { label: "Total Buyers", value: data.totalBuyers },
            { label: "Total Sellers", value: data.totalSellers },
            { label: "Total Mechanics", value: data.totalMechanics },
          ].map((item, i) => (
            <div key={i} className="overview-card" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", textAlign: "center" }}>
              <h2 style={{ color: "#ff6b00" }}>{item.label}</h2>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="earnings-overview" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", marginTop: "2rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#ff6b00", textAlign: "center" }}>Total Earnings</h2>
          <div style={{ textAlign: "center", fontSize: "2rem", fontWeight: "bold", color: "#ff6b00" }}>
            ₹{data.totalEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="activity-container" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", marginTop: "2rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#ff6b00" }}>Recent Activity</h2>
          {data.recentActivity.length > 0 ? (
            <ul style={{ listStyle: "none", padding: 0 }}>
              {data.recentActivity.map((act, i) => (
                <li key={i} style={{ padding: "0.75rem 0", borderBottom: "1px solid #eee", display: "flex", justifyContent: "space-between" }}>
                  <span>{act.description}</span>
                  <span style={{ color: "#666", fontSize: "0.9rem" }}>
                    {new Date(act.timestamp).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Dashboard;