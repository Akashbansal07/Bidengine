import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from "framer-motion";
import moment from 'moment';
import { useAuth } from '../context/authContext';

function BidsItem({ bid, userId }) {
    const navigate = useNavigate();
    const { authState } = useAuth();
    const [updatedBid, setUpdatedBid] = useState(bid); // State to manage bid updates
    const [status, setStatus] = useState('');
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        const updateBidStatus = () => {
            const currentTime = moment();
            const startTime = moment(updatedBid.startTime);
            const endTime = moment(updatedBid.endTime);
            const isStarted = currentTime.isAfter(startTime);
            const isExpired = currentTime.isAfter(endTime);
            const timeLeft = isStarted ? endTime.diff(currentTime) : startTime.diff(currentTime);
            const status = isExpired ? 'Expired' : isStarted ? 'Active' : 'Starts In';

            // Convert the timeLeft to duration format
            const duration = moment.duration(timeLeft);
            const hours = Math.floor(duration.asHours());
            const minutes = duration.minutes();
            const seconds = duration.seconds();

            setStatus(status);
            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        // Update status every second
        const interval = setInterval(updateBidStatus, 1000);
        updateBidStatus(); // Initial call

        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [updatedBid]);

    // Determine whether the user is the publisher or a participant
    const userRole = updatedBid.bidAdmin === userId ? "Publisher" : "Participator";

    return (
        <motion.div whileHover={{ scale: 1.05 }} className='bid-container ' onClick={() => navigate('bids', { state: { bid: updatedBid } })}>
            <p className='bid-icon'>{updatedBid.bidTitle[0]}</p>
            <div className='flex flex-col'>
                <p className='bid-title'>{updatedBid.bidTitle}</p>
                <p className='bid-role'>{userRole}</p> {/* Display the user role here */}
            </div>
            <div className='bid-status m-2'>
                {status !== 'Expired' && <p className='bid-timeLeft'>{timeLeft}</p>}
                <p
                    className={` ${status === 'Expired' ? 'text-red-500' :
                        status === 'Active' ? 'text-green-500' :
                            status === 'Starts In' ? 'text-gray-500' : ''
                        }`}
                >
                    {status}
                </p>
            </div>
        </motion.div>
    );
}

export default BidsItem;
