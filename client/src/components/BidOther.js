import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';

function BidOther({ bidData, rank }) {
    const lightTheme = useSelector((state) => state.themekey);
    const [bidderName, setBidderName] = useState('Your Bid');

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const response = await fetch('http://localhost:5008/user/fetchUsers/', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`, // Replace with your actual token
                    },
                });
                const data = await response.json();
                const user = data.find(user => user._id === bidData.bidderid);
                if (user) {
                    setBidderName(user.name);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUserName();
    }, [bidData.bidderid]);

    const bidAmount = bidData.bidAmount || 'No Amount';
    const timestamp = bidData.timestamp || 'No Timestamp';

    return (
        <motion.div whileHover={{ scale: 1.03 }} className={`flex items-center justify-between p-4 rounded-lg shadow-lg w-full ${lightTheme ? "bg-white text-black" : "dark"}`}>
            <div className={`flex items-center ${lightTheme ? "" : "dark"}`}>
                <p className={`bid-icon text-xl font-bold ${lightTheme ? "" : "text-gray-300"}`}>{bidderName[0]}</p>
                <div className={`ml-4 flex flex-col ${lightTheme ? "" : "dark"}`}>
                    <p className='bid-otherTitle text-lg font-semibold'>{bidderName}</p>
                    <p className='bid-lastBid text-xl font-medium'>{bidAmount}</p>
                    <p className='self-timestamp text-sm'>{timestamp}</p>
                </div>
            </div>
            <div className={`flex items-center justify-between ${lightTheme ? "" : "dark"}`}>
                <p className='rank text-xl font-bold'>{`Rank: ${rank}`}</p>
            </div>
        </motion.div>
    );
}

export default BidOther;