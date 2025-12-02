import React from 'react';

const RentalChatHeader = ({ chat, otherUser, carName, rentalPeriod }) => {
  const getUserName = () => {
    console.log('=== RENTAL USER NAME DEBUG ===');
    console.log('otherUser:', otherUser);
    
    if (!otherUser) {
      console.log('No other user in rental chat');
      return 'User';
    }
    
    // Try multiple name field combinations
    const firstName = otherUser.firstName || otherUser.first_name || otherUser.fname || '';
    const lastName = otherUser.lastName || otherUser.last_name || otherUser.lname || '';
    
    const fullName = `${firstName} ${lastName}`.trim();
    
    const name = fullName || 
                 otherUser.name || 
                 otherUser.username || 
                 otherUser.displayName ||
                 otherUser.email?.split('@')[0] || 
                 'User';
    
    console.log('Rental user name result:', name);
    return name;
  };

  const getCarImage = () => {
    console.log('=== RENTAL CAR IMAGE DEBUG ===');
    console.log('chat.rentalRequest:', chat?.rentalRequest);
    
    // Try multiple possible image paths for rental chat
    const imagePaths = [
      chat?.rentalRequest?.vehicleImage,
      chat?.rentalRequest?.carImage,
      chat?.rentalRequest?.image,
      chat?.rentalRequest?.vehicleImages?.[0],
      chat?.vehicleImage,
      chat?.carImage,
      chat?.image
    ];
    
    console.log('Rental image paths available:', imagePaths.filter(Boolean));
    
    const image = imagePaths.find(img => img && img !== null && img !== 'null' && img !== '');
    console.log('Selected rental image:', image);
    
    return image || 'https://via.placeholder.com/400x300/3b82f6/ffffff?text=Rental+Vehicle';
  };

  const getCarName = () => {
    return carName || chat?.rentalRequest?.vehicleName || 'Vehicle';
  };

  const getRentalPeriod = () => {
    if (rentalPeriod) return rentalPeriod;
    if (chat?.rentalRequest?.pickupDate && chat?.rentalRequest?.dropDate) {
      const pickup = new Date(chat.rentalRequest.pickupDate).toLocaleDateString();
      const drop = new Date(chat.rentalRequest.dropDate).toLocaleDateString();
      return `${pickup} - ${drop}`;
    }
    return 'Rental Period';
  };

  const getRentalStatus = () => {
    if (chat?.rentalRequest?.status === 'active') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
          ACTIVE RENTAL
        </span>
      );
    } else if (chat?.rentalRequest?.status === 'pending') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
          PENDING
        </span>
      );
    } else if (chat?.rentalRequest?.status === 'completed') {
      return (
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
          COMPLETED
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-orange-600 text-white px-6 py-4 border-b">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/30">
            <img 
              src={getCarImage()} 
              alt="car" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{getUserName()}</h3>
            <p className="text-sm text-white/90">{getCarName()}</p>
            <p className="text-xs text-white/80">{getRentalPeriod()}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-white/90">Online</span>
          </div>
          {getRentalStatus()}
        </div>
      </div>
    </div>
  );
};

export default RentalChatHeader;