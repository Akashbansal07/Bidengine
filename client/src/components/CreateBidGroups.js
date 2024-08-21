import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { useAuth } from '../context/authContext'; 
import { useSelector } from 'react-redux';
import "./myStyles.css";
import { io } from 'socket.io-client';

function CreateBidGroups() {
  const lightTheme = useSelector((state) => state.themekey);
  const { authState } = useAuth();
  const [bidTitle, setBidTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [mainPrice, setMainPrice] = useState("");
  const [bidDescription, setBidDescription] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (authState.isAuthenticated) {
      const newSocket = io('https://bidengine.onrender.com');
      setSocket(newSocket);

      // Cleanup on component unmount
      return () => {
        newSocket.disconnect();
      };
    }
  }, [authState.isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);
    const currentDateTime = new Date();

    if (startDateTime < currentDateTime) {
      alert('Start date and time must be greater than or equal to the current date and time.');
      return;
    }

    if (endDateTime <= startDateTime) {
      alert('End date and time must be greater than the start date and time.');
      return;
    }

    if (isNaN(mainPrice) || mainPrice <= 0) {
      alert('Please enter a valid number for the main bid amount.');
      return;
    }

    try {
      const response = await fetch('https://bidengine.onrender.com/bid/createbid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.token}`,
        },
        body: JSON.stringify({
          bidTitle,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          BidAmount: parseFloat(mainPrice),
          BidDescription: bidDescription,
        }),
      });

      if (response.ok) {
        alert('Bid created successfully!');
        if (socket) {
          socket.emit('update', {}); // Emit event after ensuring the socket is initialized
        }
      } else {
        throw new Error('Failed to create bid');
      }

    } catch (error) {
      console.error(error);
      alert('Failed to create bid');
    }
  };

  return (
    <form className={"createGroups-container" + (lightTheme ? "" : " dark ")} onSubmit={handleSubmit}>
      <h2 className={"form-heading" + (lightTheme ? "" : " dark ")}>Create Bid</h2>
      <input
        type="text"
        placeholder="Enter bid title..."
        className={"outline-none border-0 text-base" + (lightTheme ? "" : " dark ")}
        value={bidTitle}
        onChange={(e) => setBidTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Enter bid description..."
        className={"outline-none border-0 text-base" + (lightTheme ? "" : " dark ")}
        value={bidDescription}
        onChange={(e) => setBidDescription(e.target.value)}
        required
      />
      <div className="date-time-container">
        <input
          type="date"
          placeholder="Start Date"
          className={"outline-none border-0 text-base" + (lightTheme ? "" : " dark ")}
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
        />
        <input
          type="time"
          placeholder="Start Time"
          className={"outline-none border-0 text-base" + (lightTheme ? "" : " dark ")}
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
      </div>
      <div className="date-time-container">
        <input
          type="date"
          placeholder="End Date"
          className={"outline-none border-0 text-base" + (lightTheme ? "" : " dark ")}
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          required
        />
        <input
          type="time"
          placeholder="End Time"
          className={"outline-none border-0 text-base" + (lightTheme ? "" : " dark ")}
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>
      <div className="main-bid-amount-container">
        <input
          type="number"
          placeholder="Enter bid amount"
          className={"outline-none border-0 text-base mb-2" + (lightTheme ? "" : " dark ")}
          value={mainPrice}
          onChange={(e) => setMainPrice(e.target.value)}
          required
          min="0"
        />
      </div>
      <Button className={(lightTheme ? "" : " dark ")} variant="contained" color="primary" type="submit">
        Submit
      </Button>
    </form>
  );
}

export default CreateBidGroups;
