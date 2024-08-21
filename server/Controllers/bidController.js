const asyncHandler = require("express-async-handler");
const Bid = require("../models/bidModel");
const User = require("../models/userModel");

// Create a new bid
const createBid = asyncHandler(async (req, res) => {
    const { bidTitle, startTime, endTime, BidAmount, BidDescription } = req.body;

    // Check if all required fields are provided
    if (!bidTitle || !startTime || !endTime || !BidAmount || !BidDescription) {
        res.status(400);
        throw new Error("All fields are required");
    }

    // Get the ID of the user creating the bid
    const bidAdmin = req.user._id;

    // Create the new bid
    const bid = await Bid.create({
        bidTitle,
        startTime,
        endTime,
        BidAmount,
        BidDescription,
        bidAdmin,
        maxAmount: BidAmount,
        bidStatus: "pending",
    });

    // Find the user who is creating the bid
    const user = await User.findById(bidAdmin);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Add the new bid to the user's publishedBids array
    user.publishedBids.push(bid._id);

    // Save the updated user document
    await user.save();

    // Return the newly created bid
    res.status(201).json(bid);
});



// Access bid details
const accessBid = asyncHandler(async (req, res) => {
    const bid = await Bid.findById(req.params.id);

    if (!bid) {
        res.status(404);
        throw new Error("Bid not found");
    }

    // Check if user is bidAdmin or a participant
    if (String(bid.bidAdmin) === String(req.user._id) || bid.bidders.some(bidder => String(bidder.user) === String(req.user._id))) {
        res.json(bid);
    } else {
        res.status(403);
        throw new Error("Not authorized to access this bid");
    }
});

// Fetch all bids for the user (published and participated)
const fetchBids = asyncHandler(async (req, res) => {
    // Find the user by ID from the token
    const user = await User.findById(req.user._id)
        .populate('publishedBids')      // Populate the publishedBids array
        .populate('participatedBids')   // Populate the participatedBids array
        .populate('invitations.bid');   // Populate the invitations array with bid details

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Combine publishedBids, participatedBids, and bids from invitations into one array
    const allBids = [
        ...user.publishedBids,
        ...user.participatedBids,
      // ...user.invitations.map(invitation => invitation.bid)  // Extract the bid from invitations
    ];

    // Extract the invitations array
    const invitations = user.invitations;

    // Return both the combined allBids array and the separate invitations array
    res.json({
        allBids,
        invitations
    });
});



// Invite a user to a bid
const inviteUserToBid = asyncHandler(async (req, res) => {
    const { bidId, name } = req.params;

    // Find the bid by bidId
    const bid = await Bid.findById(bidId);
    if (!bid) {
        res.status(404);
        throw new Error("Bid not found");
    }

    // Ensure the request is from the bidAdmin
    if (String(bid.bidAdmin) !== String(req.user._id)) {
        res.status(403);
        throw new Error("Only the bid admin can invite users");
    }

    // Ensure the bid is in the user's publishedBids
    const user = await User.findById(req.user._id);
    if (!user.publishedBids.includes(bid._id)) {
        res.status(403);
        throw new Error("You can only invite users to bids you have published");
    }

    // Find the user to invite by name
    const userToInvite = await User.findOne({ name });
    if (!userToInvite) {
        res.status(404);
        throw new Error("User not found");
    }

    // Check if the user is already invited
    if (userToInvite.invitations.includes(bid._id)) {
        res.status(400);
        throw new Error("User is already invited");
    }

    // Add the bid to the user's invitations array
    userToInvite.invitations.push(bid._id);

    // Add the user to the bid's invitedUsers array
    bid.invitedUsers.push({ user: userToInvite._id });

    // Save the updates to both the bid and the user
    await bid.save();
    await userToInvite.save();

    // Send a response indicating success
    res.status(200).json({ message: "User invited successfully" });
});



// Accept an invitation to a bid
// In your bidController.js
const acceptInvite = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { action } = req.body;  // 'accept' or 'reject'

    // Find the user
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    // Find the bid by ID
    const bid = await Bid.findById(id);
    if (!bid) {
        res.status(404);
        throw new Error("Bid not found");
    }

    // Ensure the user is in the invitedUsers array
    const invite = bid.invitedUsers.find(invite => String(invite.user) === String(user._id));
    if (!invite) {
        res.status(403);
        throw new Error("You are not invited to this bid");
    }

    if (action === 'accept') {
        // Remove the bid from the user's invitations array
        user.invitations = user.invitations.filter(invitationId => String(invitationId) !== String(id));

        // Add the user to the bidders list if not already present
        if (!bid.bidders.some(bidder => String(bidder.user) === String(user._id))) {
            bid.bidders.push({ user: user._id, bidPlaced: 0 });
        }

        // Add the bid to the user's participatedBids array
        if (!user.participatedBids.includes(bid._id)) {
            user.participatedBids.push(bid._id);
        }
    } else if (action === 'reject') {
        // Remove the bid from the user's invitations array
        user.invitations = user.invitations.filter(invitationId => String(invitationId) !== String(id));
    } else {
        res.status(400);
        throw new Error("Invalid action");
    }

    // Save changes
    await bid.save();
    await user.save();

    res.status(200).json({ message: action === 'accept' ? "Invitation accepted" : "Invitation rejected" });
});



// Place a bid on a bid
const placeBid = asyncHandler(async (req, res) => {
    const { bidAmount } = req.body;

    if (!bidAmount || typeof bidAmount !== 'number') {
        res.status(400);
        throw new Error("Bid amount must be a number");
    }

    const bid = await Bid.findById(req.params.id);

    if (!bid) {
        res.status(404);
        throw new Error("Bid not found");
    }

    // Check if user is a participant and not the bidAdmin
    if (String(bid.bidAdmin) === String(req.user._id) || !bid.bidders.some(bidder => String(bidder.user) === String(req.user._id))) {
        res.status(403);
        throw new Error("Not authorized to place a bid");
    }

    // Check if the bid is active
    const currentTime = new Date();
    if (currentTime < bid.startTime || currentTime > bid.endTime) {
        res.status(400);
        throw new Error("Bid is not active");
    }

    // Check if the new bid amount is greater than the current max amount
    if (bidAmount <= bid.maxAmount) {
        res.status(400);
        throw new Error("Bid amount must be greater than the current max amount");
    }

    // Update the bid with the new amount and save
    bid.maxAmount = bidAmount;
    bid.bidders.find(bidder => String(bidder.user) === String(req.user._id)).bidPlaced = bidAmount;

    await bid.save();

    res.json(bid);
});



// In your userController.js
const allbids = asyncHandler(async (req, res) => {
    try {
        // Fetch all bids from the database without any filtering
        const allBids = await Bid.find({}).populate('bidAdmin', 'name email'); // Optionally populate with bidAdmin details

        // Return the array of all bids
        res.status(200).json({
            success: true,
            data: allBids
        });
    } catch (error) {
        // Handle any errors that occur during the operation
        res.status(500).json({
            success: false,
            message: 'Failed to fetch all bids',
            error: error.message
        });
    }
});



module.exports = {
    createBid,
    accessBid,
    fetchBids,
    inviteUserToBid,
    acceptInvite,
    placeBid,
    allbids
};
