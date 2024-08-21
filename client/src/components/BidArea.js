import React, { useState, useEffect, useId } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import BidOther from './BidOther';
import moment from 'moment';
import { IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useAuth } from '../context/authContext';


function BidArea() {
    const location = useLocation();
    const lightTheme = useSelector((state) => state.themekey);
    const [bid, setBid] = useState(null);
    const [bidAmount, setBidAmount] = useState("");
    const [bidComment, setBidComment] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [userId, setUserId] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const fetchBidData = async () => {
            try {
                const response = await axios.get('https://bidengine.onrender.com/bid', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                // Find the specific bid from the allBids array
                const bid = response.data.allBids.find(bid => bid._id === location.state.bid._id);

                if (bid) {
                    setBid(bid); // Set the bid state with the specific bid
                } else {
                    console.error("Bid not found");
                }
            } catch (error) {
                console.error("Error fetching bid data:", error);
            }
        };

        // Fetch the bid data only if location.state has a bid ID
        if (location.state && location.state.bid && location.state.bid._id) {
            fetchBidData();
        }

        const fetchUserInfo = async () => {
            try {
                const response = await axios.get('https://bidengine.onrender.com/user/', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                setUserId(response.data._id);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        fetchUserInfo();

        // Establish a socket connection
        const newSocket = io('https://bidengine.onrender.com');
        setSocket(newSocket);

        // Handle incoming bid updates
        newSocket.on('bidUpdate', (data) => {
            if (data === bid?._id) {
                fetchBidData(); // Check if the bidId matches the current bid._id
                console.log("Received bid update", data);
            }
        });

        // Clean up the socket connection on component unmount
        return () => {
            newSocket.disconnect();
        };
    }, [location.state, bid?._id]);  // Ensure to include bid._id in dependency array if used in effect


    const getTimeRemaining = () => {
        const now = moment();
        const endTime = moment(bid.endTime);
        const startTime = moment(bid.startTime);

        if (now.isBefore(startTime)) {
            const duration = moment.duration(startTime.diff(now));
            return {
                status: "Starts In",
                color: "grey",
                days: duration.days(),
                hours: duration.hours(),
                minutes: duration.minutes(),
                seconds: duration.seconds(),
            };
        } else if (now.isBefore(endTime)) {
            const duration = moment.duration(endTime.diff(now));
            return {
                status: "Active",
                color: "green",
                days: duration.days(),
                hours: duration.hours(),
                minutes: duration.minutes(),
                seconds: duration.seconds(),
            };
        } else {
            return {
                status: "Expired",
                color: "red",
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0,
            };
        }
    };

    const timeRemaining = bid ? getTimeRemaining() : null;

    const handleInvite = async () => {
        try {
            const response = await axios.post(
                `https://bidengine.onrender.com/bid/invite/${bid._id}/${bidComment}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setSuccessMessage("User invited successfully");
            setErrorMessage("");
            socket.emit('update', { bidId: bid._id });
        } catch (error) {
            console.error("Error sending invitation:", error);
            setErrorMessage("Failed to send invite");
            setSuccessMessage("");
        }
    };

    const handlePlaceBid = async () => {
        try {
            const amount = parseFloat(bidAmount);
            if (isNaN(amount) || amount <= 0) {
                setErrorMessage("Please enter a valid bid amount.");
                return;
            }

            const response = await axios.post(
                `https://bidengine.onrender.com/bid/placeBid/${bid._id}`,
                { bidAmount: amount },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            setBid(response.data);
            setSuccessMessage("Bid placed successfully");
            setErrorMessage("");

          
            // Emit the updated data to the server
            socket.emit('submit', {  });

        } catch (error) {
            console.error("Error placing bid:", error);
            setErrorMessage("Failed to place bid");
            setSuccessMessage("");
        }
    };

    if (!bid || userId === null) {
        return <p>Loading...</p>;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ ease: "anticipate", duration: 0.3 }}
                className={`BidArea-container mx-4 m-4 rounded-lg ${lightTheme ? "" : "dark"}`}
            >
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    className={`flex items-center justify-between p-4 rounded-lg shadow-lg  ${lightTheme ? "bg-white" : "dark"} ${lightTheme ? "text-black" : "dark"}`}
                >
                    <div className="flex items-center space-x-4">
                        <p className={`bid-icon text-2xl font-bold ${lightTheme ? "" : "text-gray-300"}`}>{bid.bidTitle[0]}</p>
                        <div className="flex flex-col">
                            <p className={`bid-title text-xl font-semibold ${lightTheme ? "" : "text-gray-300"}`}>{bid.bidTitle}</p>
                            <p className={`bid-timeLeft`} style={{ color: timeRemaining.color }}>
                                {timeRemaining.status} 
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className={`text-lg font-medium ${lightTheme ? "" : "text-gray-300"}`}>Bid Amount: {bid.BidAmount}</p>
                        <p className={`text-lg font-medium ${lightTheme ? "" : "text-gray-300"}`}>Max Bid: {bid.maxAmount}</p>
                    </div>
                </motion.div>
                <motion.p
                    whileHover={{ scale: 1.01 }}
                    className={`h-[20%] rounded-3xl overflow-y-auto bg-white p-2 shadow-lg ${lightTheme ? "" : "dark"}`}
                >
                    <p className='m-3'>
                    {timeRemaining.status === "Expired" ? (
                        `The total number of users participated : ${bid.bidders.length} and the maximum bid amount placed is: ${bid.maxAmount}`
                    ) : (
                        bid.BidDescription
                    )}
                    </p>
                </motion.p>

                <div className={`leaderboard-container overflow-scroll h-[40vh] ${lightTheme ? "" : "dark"}`}>
                    <h2 className={`leaderboard-heading ${lightTheme ? "" : "dark"}`}>Leaderboard</h2>
                    <div className={`bids-list ${lightTheme ? "" : "dark"}`}>
                        {bid.bidders.length > 0 ? (
                            bid.bidders
                                .sort((a, b) => b.bidPlaced - a.bidPlaced)
                                .map((bidder, index) => (
                                    <BidOther
                                        key={index}
                                        bidData={{
                                            bidderid: bidder.user || 'Unknown',
                                            bidAmount: bidder.bidPlaced,
                                            timestamp: moment(bidder.createdAt).format('hh:mm A'),
                                            bidid: bid._id
                                        }}
                                        rank={index + 1}
                                    />
                                ))
                        ) : (
                            <p>No bids placed yet.</p>
                        )}
                    </div>
                </div>
                {bid.bidAdmin === userId ? (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`text-input-area ${lightTheme ? "" : "dark"}`}
                    >
                        <input
                            type="text"
                            placeholder='Invite users'
                            className={`outline-none border-0 text-base ${lightTheme ? "" : "dark"}`}
                            value={bidComment}
                            onChange={(e) => setBidComment(e.target.value)}
                        />
                        <IconButton onClick={handleInvite}>
                            <SendIcon />
                        </IconButton>
                    </motion.div>
                ) : (
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className={`text-input-area ${lightTheme ? "" : "dark"}`}
                    >
                        <input
                            type="Number"
                            placeholder='Enter your bid'
                            className={`outline-none border-0 text-base ${lightTheme ? "" : "dark"}`}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                        />
                        <IconButton onClick={handlePlaceBid}>
                            <SendIcon />
                        </IconButton>
                    </motion.div>
                )}
                {successMessage && <div className="text-green-500">{successMessage}</div>}
                {errorMessage && <div className="text-red-500">{errorMessage}</div>}
            </motion.div>
        </AnimatePresence>
    );
}

export default BidArea;
