import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/authContext';
import { useSelector } from 'react-redux';
import { IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { motion } from "framer-motion";
import './myStyles.css';

function User_groups() {
    const { authState } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const lightTheme = useSelector((state) => state.themekey);

    useEffect(() => {
        if (authState.isAuthenticated) {
            fetch('https://bidengine.onrender.com/user/fetchUsers/', {
                headers: {
                    'Authorization': `Bearer ${authState.token}`,
                },
            })
                .then(response => response.json())
                .then(data => {
                    setUsers(data);
                    setFilteredUsers(data); // Set both users and filtered users initially
                })
                .catch(error => console.error('Error fetching users:', error));
        }
    }, [authState]);

    useEffect(() => {
        // Filter users based on the search query
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchQuery, users]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className='BidArea-container space-y-4 m-4 '>
            <div className={'sb-header' + (lightTheme ? "" : " dark ")}>
               <div  className='flex items-center gap-2'>
               <div>
                    <IconButton className={lightTheme ? "" : " dark "}>
                        <AccountCircleIcon />
                    </IconButton>
                </div>
                <div> List of all the users</div>
               </div>
            </div>
            <div className={'sb-search space-x-2' + (lightTheme ? "" : " dark ")}>
                <IconButton className={lightTheme ? "" : " dark "}>
                    <SearchIcon />
                </IconButton>
                <input
                    className={"outline-none border-0 text-base" + (lightTheme ? "" : " dark ")}
                    placeholder='Search'
                    value={searchQuery}
                    onChange={handleSearchChange}
                />
            </div>
            <div className={' sb-bids overflow-y-scroll overflow-hidden scrollbar-none' + (lightTheme ? "" : " dark ")}>
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                        <motion.div whileHover={{ scale: 1.05 }} key={user._id} className={'ug-item' + (lightTheme ? "" : " dark ")}>
                            <p className='bid-icon'>T</p>
                            <p className='bid-title'>{user.name}</p>
                        </motion.div>
                    ))
                ) : (
                    <p>No users found.</p>
                )}
            </div>
        </div>
    );
}

export default User_groups;
