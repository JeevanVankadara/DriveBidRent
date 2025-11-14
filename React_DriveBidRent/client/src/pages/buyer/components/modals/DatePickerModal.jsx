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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Select Rental Dates</h2>
        
        {errors.general && (
          <div className="error-message" style={{color: 'red', marginBottom: '1rem', textAlign: 'center'}}>
            {errors.general}
          </div>
        )}
        
        <div className="form-group">
          <label>Pickup Date</label>
          <input
            type="date"
            value={pickupDate}
            onChange={handlePickupDateChange}
            min={formatDate(new Date())}
            max={formatDate(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000))} // 30 days max
          />
          {errors.pickupDate && (
            <div className="error-message" style={{color: 'red', fontSize: '0.8rem'}}>
              {errors.pickupDate}
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label>Drop Date</label>
          <input
            type="date"
            value={dropDate}
            onChange={handleDropDateChange}
            min={pickupDate ? formatDate(new Date(new Date(pickupDate).getTime() + 86400000)) : formatDate(new Date())}
          />
          {errors.dropDate && (
            <div className="error-message" style={{color: 'red', fontSize: '0.8rem'}}>
              {errors.dropDate}
            </div>
          )}
        </div>
        
        {rental.driverAvailable && (
          <div className="form-group checkbox-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeDriver}
                onChange={handleDriverToggle}
                style={{ transform: 'scale(1.2)' }}
              />
              <span>
                Include Driver (₹{rental.driverRate}/day) - 
                <strong style={{ color: includeDriver ? '#27ae60' : '#95a5a6' }}>
                  {includeDriver ? ' INCLUDED' : ' NOT INCLUDED'}
                </strong>
              </span>
            </label>
          </div>
        )}
        
        <div className="cost-summary">
          <h3 style={{ color: '#27ae60', marginBottom: '1rem' }}>Total Cost: ₹{totalCost}</h3>
          {pickupDate && dropDate && totalCost > 0 && (
            <div className="cost-breakdown" style={{ 
              background: '#f8f9fa', 
              padding: '1rem', 
              borderRadius: '8px',
              fontSize: '0.9rem'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Vehicle:</strong> ₹{Math.ceil((new Date(dropDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)) * rental.costPerDay} 
                <span style={{ color: '#7f8c8d' }}>
                  ({Math.ceil((new Date(dropDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))} days × ₹{rental.costPerDay}/day)
                </span>
              </div>
              {rental.driverAvailable && (
                <div>
                  <strong>Driver:</strong> 
                  {includeDriver ? (
                    <span>
                      ₹{Math.ceil((new Date(dropDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)) * rental.driverRate}
                      <span style={{ color: '#7f8c8d' }}>
                        ({Math.ceil((new Date(dropDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))} days × ₹{rental.driverRate}/day)
                      </span>
                    </span>
                  ) : (
                    <span style={{ color: '#95a5a6' }}> Not included</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleProceed}>
            Proceed to Payment - ₹{totalCost}
          </button>
        </div>
      </div>
    </div>
  );
}