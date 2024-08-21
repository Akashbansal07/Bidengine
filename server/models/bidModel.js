const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema({
    bidTitle: {
        type: String,
        required: true
    },
    bidAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Reference to the User model
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    bidStatus: {
        type: String,
        enum: ['pending', 'active', 'ended'],
        required: true
    },
    BidAmount: {
        type: Number,
        required: true
    },
    maxAmount: {
        type: Number,
        required: true,
        default: function() {
            return this.BidAmount;
        }
    },
    BidDescription: {
        type: String,
        required: true
    },
    invitedUsers: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            status: {
                type: String,
                enum: ['invited', 'accepted', 'rejected'],
                default: 'invited'
            }
        }
    ],
    bidders: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
            bidPlaced: {
                type: Number,
                required: true,
                default: function() {
                    return this.BidAmount;
                }
            }
        }
    ],
}, { timestamps: true });

// Pre-save hook to automatically set the bidStatus based on startTime and endTime
bidSchema.pre('save', function(next) {
    const currentTime = new Date();
    if (this.startTime > currentTime) {
        this.bidStatus = 'pending';
    } else if (this.startTime <= currentTime && this.endTime >= currentTime) {
        this.bidStatus = 'active';
    } else {
        this.bidStatus = 'ended';
    }

    this.bidders.forEach(bidder => {
        if (bidder.bidPlaced === undefined || bidder.bidPlaced === 0) {
            bidder.bidPlaced = this.BidAmount;
        }
    });
    next();
});



const Bid = mongoose.model("Bid", bidSchema);

module.exports = Bid;
