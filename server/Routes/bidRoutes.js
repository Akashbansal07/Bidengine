const express = require("express");
const {
    createBid,
    accessBid,
    fetchBids,
    inviteUserToBid,
    acceptInvite,
    placeBid,
    allbids
    
} = require("../Controllers/bidController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route for creating a new bid
router.route("/createBid").post(protect, createBid);

// Route for accessing a specific bid's details
router.route("/:id").get(protect, accessBid);

// Route for fetching all bids (published and participated)
router.route("/").get(protect, fetchBids);

// Route for inviting a user to a specific bid
router.route("/invite/:bidId/:name").post(protect, inviteUserToBid);

router.route("/bids").get(protect, allbids);

// Route for accepting an invitation to a specific bid
router.route("/acceptInvite/:id").post(protect, acceptInvite);


// Route for placing a bid on a specific bid
router.route("/placeBid/:id").post(protect, placeBid);



module.exports = router;
