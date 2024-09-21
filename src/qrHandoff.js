import express from 'express';

const router = express.Router();

import User from './models/User.js';

/**
 * POST /api/qr/handoff
 * Associates a QR code with a user based on their email
 */
router.post('/handoff', async (req, res) => {
  // Query params should be email and a unique generated code for this particular handoff session
  const { email, uniqueCode } = req.query;

  if (!email || !uniqueCode) {
    return res.status(400).json({ message: 'Email and uniqueCode are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // NOTE: We will need to update the User model to include a qrCodeID field
    user.qrCodeID = uniqueCode;
    await user.save();

    // Create a deep link to the camera app
    const cameraAppDeepLink = `cameraapp://open?email=${encodeURIComponent(email)}&uniqueCode=${encodeURIComponent(uniqueCode)}`;

    // Return the camera app deep link for use in QR code
    res.status(200).json({ cameraAppDeepLink });
  } catch (error) {
    console.error('Error in QR handoff:', error);
    res.status(500).json({ message: 'An error occurred while processing your request', error: error.message });
  }
});


export default router;