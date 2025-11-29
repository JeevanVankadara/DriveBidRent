// controllers/auctionManager/assignMechanic.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import User from '../../models/User.js';
import Chat from '../../models/Chat.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getAssignMechanic = async (req, res) => {
  try {
    const request = await AuctionRequest.findById(req.params.id).populate('sellerId');
    if (!request) return res.json(send(false, 'Request not found'));

    const mechanics = await User.find({
      userType: 'mechanic',
      city: request.sellerId.city,
      approved_status: 'Yes'
    }).select('firstName lastName shopName experienceYears _id');

    res.json(send(true, 'Mechanics loaded', { request, mechanics }));
  } catch (err) {
    console.error('Assign mechanic error:', err);
    res.json(send(false, 'Failed to load mechanics'));
  }
};

export const assignMechanic = async (req, res) => {
  try {
    const { mechanicId, mechanicName } = req.body;

    const updated = await AuctionRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'assignedMechanic',
        assignedMechanic: mechanicId,
        mechanicName
      },
      { new: true }
    );

    if (!updated) return res.json(send(false, 'Request not found'));

    try {
      await User.findByIdAndUpdate(
        mechanicId,
        { $addToSet: { assignedRequests: updated._id } },
        { new: true }
      );
    } catch (uErr) {
      console.error('Failed to update mechanic assignedRequests:', uErr);
      return res.json(send(true, 'Mechanic assigned successfully, but failed to update mechanic record'));
    }

    // Auto-create an inspection chat for this assignment (one per mechanic + task)
    try {
      const exists = await Chat.findOne({
        type: 'inspection',
        mechanic: mechanicId,
        inspectionTask: updated._id
      });

      if (!exists) {
        await Chat.create({
          type: 'inspection',
          mechanic: mechanicId,
          auctionManager: req.user?._id || null,
          inspectionTask: updated._id,
          car: updated._id,
          carModel: 'AuctionRequest',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days by default
          title: `Inspection: ${updated.vehicleName}`
        });
      }
    } catch (cErr) {
      console.error('Failed to create inspection chat:', cErr);
      // Non-fatal: respond success but inform in logs
    }

    res.json(send(true, 'Mechanic assigned successfully'));
  } catch (err) {
    console.error('Assign mechanic save error:', err);
    res.json(send(false, 'Failed to assign mechanic'));
  }
};