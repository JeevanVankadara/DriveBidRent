import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import adminServices from "../../services/admin.services";
import LoadingSpinner from "../components/LoadingSpinner";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#FF6B00', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#00BCD4', '#E91E63', '#FF5722'];

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

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-orange-600">{typeof payload[0].value === 'number' && payload[0].value > 1000 
            ? `₹${payload[0].value.toLocaleString()}` 
            : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message" style={{ textAlign: "center", color: "#c62828", marginTop: "2rem" }}>{error}</div>;

  return (
    <>
      <section className="py-8 max-w-7xl mx-auto px-6">
        <h1 className="text-center text-4xl font-bold text-orange-600 mb-10">
          <i className="fas fa-chart-line mr-3"></i>
          Platform Analytics
        </h1>

        {/* Overview Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Users', value: data.totalUsers, icon: 'fas fa-users', color: 'blue' },
            { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString()}`, icon: 'fas fa-rupee-sign', color: 'green' },
            { label: 'Cars Sold', value: data.totalCarsSold, icon: 'fas fa-car', color: 'orange' },
            { label: 'Active Rentals', value: data.activeRentals, icon: 'fas fa-key', color: 'purple' },
          ].map((item, i) => (
            <div key={i} className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-lg border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-gray-600 font-medium">{item.label}</h3>
                <i className={`${item.icon} text-2xl text-${item.color}-500`}></i>
              </div>
              <p className="text-3xl font-bold text-gray-800">{item.value.toLocaleString()}</p>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* User Type Distribution */}
          {data.userTypeDistribution && data.userTypeDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-users text-orange-600"></i>
                User Type Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.userTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.userTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Revenue Distribution */}
          {data.revenueDistribution && data.revenueDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-dollar-sign text-green-600"></i>
                Revenue Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.revenueDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ₹${value.toLocaleString()}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.revenueDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[COLORS[0], COLORS[1]][index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Car Type Distribution */}
          {data.carTypeDistribution && data.carTypeDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-car text-blue-600"></i>
                Car Type Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.carTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.carTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Auction Status Distribution */}
          {data.auctionStatusDistribution && data.auctionStatusDistribution.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-gavel text-purple-600"></i>
                Auction Status
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.auctionStatusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.auctionStatusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Car Model Distribution Bar Chart */}
        {data.carModelDistribution && data.carModelDistribution.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-chart-bar text-orange-600"></i>
              Top 10 Car Models Listed
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.carModelDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill={COLORS[0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Sellers */}
        {data.topSellers && data.topSellers.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-trophy text-yellow-500"></i>
              Top Sellers (Auction Listings)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Seller Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Cars Listed</th>
                    <th className="p-3 text-left">Cars Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSellers.map((seller, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-orange-50 transition`}>
                      <td className="p-3 border-b">
                        <span className="font-bold text-orange-600">#{i + 1}</span>
                      </td>
                      <td className="p-3 border-b font-medium">{seller.name}</td>
                      <td className="p-3 border-b text-gray-600">{seller.email}</td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {seller.totalCarsListed}
                        </span>
                      </td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {seller.carsSold}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Rental Providers */}
        {data.topRentalProviders && data.topRentalProviders.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-key text-purple-500"></i>
              Top Rental Providers
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Provider Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Rentals Listed</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRentalProviders.map((provider, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50 transition`}>
                      <td className="p-3 border-b">
                        <span className="font-bold text-purple-600">#{i + 1}</span>
                      </td>
                      <td className="p-3 border-b font-medium">{provider.name}</td>
                      <td className="p-3 border-b text-gray-600">{provider.email}</td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {provider.totalRentalsListed}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Buyers */}
        {data.topBuyers && data.topBuyers.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-shopping-cart text-green-500"></i>
              Top Buyers (Auction Purchases)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Buyer Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Total Purchases</th>
                    <th className="p-3 text-left">Total Spent</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topBuyers.map((buyer, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition`}>
                      <td className="p-3 border-b">
                        <span className="font-bold text-green-600">#{i + 1}</span>
                      </td>
                      <td className="p-3 border-b font-medium">{buyer.name}</td>
                      <td className="p-3 border-b text-gray-600">{buyer.email}</td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {buyer.totalPurchases}
                        </span>
                      </td>
                      <td className="p-3 border-b font-semibold text-green-700">
                        ₹{buyer.totalSpent.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Top Renters */}
        {data.topRenters && data.topRenters.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-users text-blue-500"></i>
              Top Renters
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Renter Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Total Rentals</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topRenters.map((renter, i) => (
                    <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition`}>
                      <td className="p-3 border-b">
                        <span className="font-bold text-blue-600">#{i + 1}</span>
                      </td>
                      <td className="p-3 border-b font-medium">{renter.name}</td>
                      <td className="p-3 border-b text-gray-600">{renter.email}</td>
                      <td className="p-3 border-b">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          {renter.totalRentals}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vehicle Sales Performance */}
        {data.vehiclePerformance && data.vehiclePerformance.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-chart-line text-orange-600"></i>
              Top 10 Vehicle Sales Performance
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <tr>
                    <th className="p-3 text-left">Rank</th>
                    <th className="p-3 text-left">Vehicle Name</th>
                    <th className="p-3 text-left">Starting Price</th>
                    <th className="p-3 text-left">Final Sale Price</th>
                    <th className="p-3 text-left">Increase</th>
                  </tr>
                </thead>
                <tbody>
                  {data.vehiclePerformance.map((vehicle, i) => {
                    const increase = ((vehicle.finalSalePrice - vehicle.startingPrice) / vehicle.startingPrice * 100).toFixed(1);
                    return (
                      <tr key={i} className={`${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-orange-50 transition`}>
                        <td className="p-3 border-b">
                          <span className="font-bold text-orange-600">#{i + 1}</span>
                        </td>
                        <td className="p-3 border-b font-medium">{vehicle.vehicleName}</td>
                        <td className="p-3 border-b">₹{vehicle.startingPrice.toLocaleString()}</td>
                        <td className="p-3 border-b font-semibold text-green-700">
                          ₹{vehicle.finalSalePrice.toLocaleString()}
                        </td>
                        <td className="p-3 border-b">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            increase > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {increase > 0 ? '+' : ''}{increase}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default Analytics;