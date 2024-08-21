import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import "./myStyles.css";
import { useSelector } from 'react-redux';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/authContext';

function Notifications() {
  const lightTheme = useSelector((state) => state.themekey);
  const { authState } = useAuth();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetch('https://bidengine.onrender.com/bid/', {
        headers: {
          'Authorization': `Bearer ${authState.token}`,
        },
      })
        .then(response => response.json())
        .then(data => {
          setNotifications(data.invitations || []); // Assuming data.invitations is an array of invitation IDs
        })
        .catch(error => console.error('Error fetching notifications:', error));
    }
  }, [authState]);

  const handleResponse = async (id, action) => {
    try {
      const response = await fetch(`https://bidengine.onrender.com/bid/acceptInvite/${id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} invitation`);
      }

      await response.json();

      // Update notifications by removing the processed one
      setNotifications(notifications.filter((notification) => notification !== id));
    } catch (error) {
      console.error(`Error ${action}ing invitation:`, error);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0 }}
        transition={{
          ease: "anticipate",
          duration: 0.3
        }}
        className={'notifications-container overflow-scroll overflow-hidden scrollbar-none' + (lightTheme ? "" : " dark ")}>
        {notifications.map((notificationId) => (
          <div key={notificationId} className={'notification-item' + (lightTheme ? "" : " dark ")}>
            <h4 className='bid-name'>Bid Invitation</h4>
            <h4 className='Id'>Bid ID: {notificationId || 'No ID Available'}</h4> {/* Displaying the Bid ID */}
            <div className='button-group'>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleResponse(notificationId, 'reject')}
              >
                Reject
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleResponse(notificationId, 'accept')}
              >
                Accept
              </Button>
            </div>
          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}

export default Notifications;
