import { useState, useEffect } from 'react';

export default function DatePickerModal({ isOpen, onClose, onProceed, onDateSelect, rental }) {
  const [pickupDate, setPickupDate] = useState('');
  const [dropDate, setDropDate] = useState('');
  const [includeDriver, setIncludeDriver] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setPickupDate('');
      setDropDate('');
      setIncludeDriver(false);
      setTotalCost(0);
      setErrors({});
    }
  }, [isOpen]);

  // Recalculate cost whenever dates or driver option changes
  useEffect(() => {
    if (pickupDate && dropDate && rental) {
      calculateCost();
    }
  }, [pickupDate, dropDate, includeDriver, rental]);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const calculateCost = () => {
    if (!pickupDate || !dropDate || !rental) {
      setTotalCost(0);
      return 0;
    }

    const pickupDateObj = new Date(pickupDate);
    const dropDateObj = new Date(dropDate);

    // Validate dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (pickupDateObj < today) {
      setErrors({ pickupDate: 'Pickup date cannot be in the past' });
      setTotalCost(0);
      return 0;
    }

    if (dropDateObj <= pickupDateObj) {
      setErrors({ dropDate: 'Drop date must be after pickup date' });
      setTotalCost(0);
      return 0;
    }

    setErrors({});

    const timeDiff = dropDateObj - pickupDateObj;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    console.log('Cost calculation:', {
      days,
      costPerDay: rental.costPerDay,
      driverRate: rental.driverRate,
      includeDriver,
      driverAvailable: rental.driverAvailable
    });

    const vehicleCost = days * rental.costPerDay;
    const driverCost = includeDriver && rental.driverAvailable ? days * rental.driverRate : 0;
    const cost = vehicleCost + driverCost;

    console.log('Total cost calculated:', {
      vehicleCost,
      driverCost,
      total: cost
    });

    setTotalCost(cost);
    // Update parent component with current selection
    onDateSelect(pickupDate, dropDate, includeDriver);

    return cost;
  };

  const handlePickupDateChange = (e) => {
    const selectedDate = e.target.value;
    setPickupDate(selectedDate);
    setErrors({});

    if (dropDate && new Date(dropDate) <= new Date(selectedDate)) {
      setDropDate('');
    }
  };

  const handleDropDateChange = (e) => {
    setDropDate(e.target.value);
    setErrors({});
  };

  const handleDriverToggle = (e) => {
    const newIncludeDriver = e.target.checked;
    console.log('Driver toggle:', newIncludeDriver);
    setIncludeDriver(newIncludeDriver);
    // Cost will be recalculated automatically by useEffect
  };

  const handleProceed = () => {
    if (!pickupDate || !dropDate) {
      setErrors({ general: 'Please select both pickup and drop dates' });
      return;
    }

    if (totalCost <= 0) {
      setErrors({ general: 'Please select valid dates to calculate the cost' });
      return;
    }

    console.log('Proceeding with final data:', {
      pickupDate,
      dropDate,
      includeDriver,
      totalCost
    });

    onProceed();
  };

  if (!isOpen) return null;

  const days = pickupDate && dropDate
    ? Math.ceil((new Date(dropDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-8 text-white">
          <h2 className="text-4xl font-bold">Select Rental Dates</h2>
          <p className="text-blue-100 mt-2">Choose your pickup and drop-off dates</p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border-2 border-red-300 text-red-700 px-6 py-4 rounded-xl font-semibold">
              ⚠️ {errors.general}
            </div>
          )}

          {/* Pickup Date */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">📅 Pickup Date</label>
            <input
              type="date"
              value={pickupDate}
              onChange={handlePickupDateChange}
              min={formatDate(new Date())}
              max={formatDate(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000))}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-lg font-semibold"
            />
            {errors.pickupDate && (
              <p className="text-red-600 text-sm font-semibold mt-2">❌ {errors.pickupDate}</p>
            )}
          </div>

          {/* Drop Date */}
          <div>
            <label className="block text-lg font-bold text-gray-800 mb-3">🏁 Drop-off Date</label>
            <input
              type="date"
              value={dropDate}
              onChange={handleDropDateChange}
              min={pickupDate ? formatDate(new Date(new Date(pickupDate).getTime() + 86400000)) : formatDate(new Date())}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition text-lg font-semibold"
            />
            {errors.dropDate && (
              <p className="text-red-600 text-sm font-semibold mt-2">❌ {errors.dropDate}</p>
            )}
          </div>

          {/* Driver Option */}
          {rental.driverAvailable && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeDriver}
                  onChange={handleDriverToggle}
                  className="w-6 h-6 accent-green-500 cursor-pointer"
                />
                <div>
                  <p className="text-lg font-bold text-gray-900">Include Professional Driver</p>
                  <p className="text-sm text-gray-600 mt-1">₹{rental.driverRate}/day</p>
                </div>
                <span className={`ml-auto px-4 py-2 rounded-full font-bold text-sm ${includeDriver
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-700'
                  }`}>
                  {includeDriver ? '✓ INCLUDED' : 'NOT INCLUDED'}
                </span>
              </label>
            </div>
          )}

          {/* Cost Summary */}
          {pickupDate && dropDate && totalCost > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-2xl p-6">
              <h3 className="text-2xl font-bold text-orange-600 mb-4">💰 Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                  <span className="text-gray-700 font-semibold">
                    Vehicle ({days} {days === 1 ? 'day' : 'days'} × ₹{rental.costPerDay}/day)
                  </span>
                  <span className="text-xl font-bold text-gray-900">₹{(days * rental.costPerDay).toLocaleString()}</span>
                </div>
                {rental.driverAvailable && includeDriver && (
                  <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                    <span className="text-gray-700 font-semibold">
                      Driver ({days} {days === 1 ? 'day' : 'days'} × ₹{rental.driverRate}/day)
                    </span>
                    <span className="text-xl font-bold text-gray-900">₹{(days * rental.driverRate).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold text-orange-600">Total Amount</span>
                  <span className="text-3xl font-black text-orange-600">₹{totalCost.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-8 py-6 flex gap-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-3 rounded-xl font-bold hover:bg-gray-600 transition transform hover:scale-105 active:scale-95"
          >
            Cancel
          </button>
          <button
            onClick={handleProceed}
            disabled={!pickupDate || !dropDate || totalCost <= 0}
            className={`flex-1 py-3 rounded-xl font-bold transition transform hover:scale-105 active:scale-95 ${pickupDate && dropDate && totalCost > 0
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            Proceed → ₹{totalCost.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}