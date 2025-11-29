import mongoose from 'mongoose';

const { Schema } = mongoose;

const chatSchema = new Schema({
  type: { type: String, enum: ['rental', 'auction', 'inspection'], required: true },
  // buyer/seller remain for rental/auction chats. For inspection chats we use mechanic/auctionManager.
  buyer: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  seller: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  mechanic: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  auctionManager: { type: Schema.Types.ObjectId, ref: 'User', required: false },

  // One of these will be populated depending on type
  rentalRequest: { type: Schema.Types.ObjectId, ref: 'RentalRequest', required: false },
  auctionRequest: { type: Schema.Types.ObjectId, ref: 'AuctionRequest', required: false },
  // For inspection chats: link to the AuctionRequest being inspected
  inspectionTask: { type: Schema.Types.ObjectId, ref: 'AuctionRequest', required: false },

  // Reference to the car; refPath allows pointing to different models
  car: { type: Schema.Types.ObjectId, refPath: 'carModel' },
  carModel: { type: String, enum: ['RentalRequest', 'AuctionRequest'] },

  // Duration control
  expiresAt: { type: Date, required: true }, // rental: endDate +2d | auction: soldAt +5d

  // Optional display info
  finalPrice: { type: Number },
  title: { type: String },

  // Existing metadata
  lastMessage: String,
  lastMessageAt: Date,
  unreadCountBuyer: { type: Number, default: 0 },
  unreadCountSeller: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes
chatSchema.index({ buyer: 1, expiresAt: 1 });
chatSchema.index({ seller: 1, expiresAt: 1 });
chatSchema.index({ rentalRequest: 1 });
chatSchema.index({ auctionRequest: 1 });
chatSchema.index({ mechanic: 1, expiresAt: 1 });
chatSchema.index({ auctionManager: 1, expiresAt: 1 });
chatSchema.index({ inspectionTask: 1 });

export default mongoose.model('Chat', chatSchema);
