import React, { useEffect, useState } from 'react';
import "./myStyles.css";
import Sidebar from './Sidebar';
import BidArea from './BidArea';
import Welcome from './Welcome';
import CreateBidGroups from './CreateBidGroups';
import Notifications from './Notifications';
import Login from './Login';
import User_groups from './User_groups';
import { Outlet } from 'react-router-dom';


function MainContainer() {
    
  return (
    <div className='main-container'>
        <Sidebar  />
        <Outlet />
        {/* <Welcome/> */}
        {/* <CreateBidGroups/> */}
        {/* <BidArea prop={bids[0]}/> */}
        {/* <Notifications/> */}
         {/* <User_groups/> */}
        
    </div>
  )
}

export default MainContainer