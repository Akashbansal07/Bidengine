import React, { useEffect, useState } from 'react';
import './myStyles.css';
import { useSelector } from 'react-redux';
import { useAuth } from '../context/authContext';

function Welcome() {
    const lightTheme = useSelector((state) => state.themekey);
    const { authState } = useAuth();
    const [userName, setUserName] = useState('');

    useEffect(() => {
        if (authState.isAuthenticated) {
            fetch('https://bidengine.onrender.com/user/', {
                headers: {
                    'Authorization': `Bearer ${authState.token}`,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    setUserName(data.name);
                })
                .catch((error) => console.error('Error fetching user data:', error));
        }
    }, [authState]);

    return (
        <div className={'welcome-container' + (lightTheme ? "" : " dark ")}>
            <h3 className='text-teal-400 text-8xl font-bold my-16'>{`<Bid Engine />`}</h3>
            <p className={'text-slate-400 text-2xl font-bold' + (lightTheme ? "" : " dark ")}>Hi,  {userName} 😊</p>
            <p className={'text-slate-400 text-2xl font-bold' + (lightTheme ? "" : " dark ")}>Create and place bids...</p>
        </div>
    );
}

export default Welcome;
