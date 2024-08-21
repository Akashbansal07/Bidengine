import React, { useEffect, useState } from 'react';
import "./myStyles.css";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { io } from 'socket.io-client';
import { IconButton } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import AddBoxIcon from '@mui/icons-material/AddBox';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../Features/themeSlice';
import { motion } from "framer-motion";
import { useAuth } from '../context/authContext';
import BidsItem from './BidsItem';

function Sidebar() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const lightTheme = useSelector((state) => state.themekey);
    const { authState } = useAuth();
    const [allBids, setAllBids] = useState([]);
    const [filteredBids, setFilteredBids] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [hasInvitations, setHasInvitations] = useState(false);
    const [userId, setUserId] = useState(null); 
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const fetchInfo = async () => {
            if (authState.isAuthenticated) {
                try {
                    // Fetch all bids
                    const bidResponse = await fetch('https://bidengine.onrender.com/bid/', {
                        headers: {
                            'Authorization': `Bearer ${authState.token}`,
                        },
                    });
                    const bidData = await bidResponse.json();
                    setAllBids(bidData.allBids);
                    setFilteredBids(bidData.allBids);

                    // Fetch user details to check invitations and get userId
                    const userResponse = await fetch('https://bidengine.onrender.com/user/', {
                        headers: {
                            'Authorization': `Bearer ${authState.token}`,
                        },
                    });
                    const userData = await userResponse.json();
                    if (userData.invitations && userData.invitations.length > 0) {
                        setHasInvitations(true);
                    }
                    setUserId(userData._id); // Set userId from the response
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            }
        };

        fetchInfo();

        const newSocket = io('https://bidengine.onrender.com');
        setSocket(newSocket);

        newSocket.on('submitted', () => {
            fetchInfo();
        });

        // Cleanup the socket when component unmounts
        return () => {
            newSocket.disconnect();
        };
    }, [authState]);

    useEffect(() => {
        // Filter bids based on the search query
        const filtered = allBids.filter(bid =>
            bid.bidTitle.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredBids(filtered);
    }, [searchQuery, allBids]);

    return (
        <div className='sidebar-container '>
            <motion.div whileHover={{ scale: 1.05 }} className={'sb-header' + (lightTheme ? "" : " dark ")}>
                <div>
                    <IconButton onClick={() => { navigate("welcome") }}>
                        <AccountCircleIcon className={'icon' + (lightTheme ? "" : " dark ")} />
                    </IconButton>
                </div>
                <div>
                    
                    <IconButton onClick={() => { navigate("user") }}>
                        <PeopleAltIcon className={'icon' + (lightTheme ? "" : " dark ")} />
                    </IconButton> 
                    <IconButton onClick={() => { navigate("create-bid") }}>
                        <AddBoxIcon className={'icon' + (lightTheme ? "" : " dark ")} />
                    </IconButton>
                    <IconButton onClick={() => { dispatch(toggleTheme()) }}>
                        {lightTheme && (<DarkModeIcon className={'icon' + (lightTheme ? "" : " dark ")} />)}
                        {!lightTheme && (<LightModeIcon className={'icon' + (lightTheme ? "" : " dark ")} />)}
                    </IconButton>
                    <IconButton onClick={() => { navigate("notification") }}>
                        <NotificationsIcon className={`icon ${hasInvitations ? "text-pink-500" : (lightTheme ? "" : " dark ")}`} />
                    </IconButton>
                </div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className={'sb-search space-x-2' + (lightTheme ? "" : " dark ")}>
                <IconButton className={lightTheme ? "" : " dark "}>
                    <SearchIcon />
                </IconButton>
                <input
                    className={"outline-none border-0 text-base" + (lightTheme ? "" : " dark ")}
                    placeholder='Search'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </motion.div>
            <div className={'sb-bids overflow-y-scroll overflow-hidden scrollbar-none' + (lightTheme ? "" : " dark ")}>
                {filteredBids.map((bid) => (
                    <BidsItem key={bid._id} bid={bid} userId={userId} /> 
                ))}
            </div>
        </div>
    );
}

export default Sidebar;
