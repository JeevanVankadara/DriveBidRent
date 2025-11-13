import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoadingSpinner from "./components/LoadingSpinner";

const ManageEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await adminServices.getManageEarnings();
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.message);
        }
      } catch (err) {
        setError("Failed to load earnings");
        if (err.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, [navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message" style={{ color: "#c62828", textAlign: "center", marginTop: "2rem" }}>{error}</div>;

  return (
    <>
      <section style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#ff6b00", textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem" }}>
          Manage Earnings
        </h1>

        <div className="stats-container" style={{ display: "flex", gap: "1.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div className="stat-card" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", flex: 1, textAlign: "center", minWidth: "200px" }}>
            <h3 style={{ color: "#ff6b00" }}>Total Revenue</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              ₹{data.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-card" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", flex: 1, textAlign: "center", minWidth: "200px" }}>
            <h3 style={{ color: "#ff6b00" }}>Revenue from Auctions</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              ₹{data.totalAuctionRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="stat-card" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", flex: 1, textAlign: "center", minWidth: "200px" }}>
            <h3 style={{ color: "#ff6b00" }}>Revenue from Rentals</h3>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
              ₹{data.totalRentalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="transactions-container" style={{ background: "#fff", padding: "1.5rem", borderRadius: "0.5rem", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
          <h2 style={{ color: "#ff6b00", fontSize: "1.5rem", marginBottom: "1.5rem" }}>Previous Transactions</h2>
          {data.transactions.length > 0 ? (
            <table className="transactions-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#ff6b00" }}>
                  <th style={{ padding: "1rem", textAlign: "left", color: "white", fontWeight: 600 }}>UTR Number</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "white", fontWeight: 600 }}>User Name</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "white", fontWeight: 600 }}>Type of Revenue</th>
                  <th style={{ padding: "1rem", textAlign: "left", color: "white", fontWeight: 600 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.map((transaction, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9f9f9" : "transparent" }}>
                    <td style={{ padding: "1rem", color: "#333" }}>{transaction.utrNumber || 'N/A'}</td>
                    <td style={{ padding: "1rem", color: "#333" }}>{transaction.userName}</td>
                    <td style={{ padding: "1rem", color: "#333" }}>{transaction.type}</td>
                    <td style={{ padding: "1rem", color: "#333" }}>
                      ₹{transaction.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No transactions available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default ManageEarnings;
