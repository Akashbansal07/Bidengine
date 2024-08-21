import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import axios from 'axios';
import "./Login.css";
import { useNavigate } from 'react-router-dom';

function Login() {
    const [name, setName] = useState('');  // Changed 'username' to 'name'
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loginData = {
                name,   // Sending data in the correct format
                password
            };

            const { data } = await axios.post('https://bidengine.onrender.com/user/login', loginData);

            // Save token or handle successful login
            localStorage.setItem('token', data.token);
            navigate('/app');
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Something went wrong');
        }
    };

    const handleSignUpClick = () => {
        navigate('/signup');
    };

    return (
        <div className="login-container">
            <div className="image-container flex-col">
                <h3 className=" text-teal-400 text-5xl font-bold my-16">{`<Bid Engine />`}</h3>
                <h4 className='text-slate-400 text-2xl font-bold mx-8'>Create and place bids...</h4>
            </div>
            
            <div className="login-box">
                <p className='text-3xl m-4'>Login to your Account</p>
                <form onSubmit={handleSubmit}>
                    <TextField
                        id="name-input"  // Changed 'username-input' to 'name-input'
                        label="Enter Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={name}  // Updated to match state
                        onChange={(e) => setName(e.target.value)}  // Updated to match state
                    />
                    <TextField
                        id="password-input"
                        label="Enter Password"
                        type="password"
                        autoComplete='current-password'
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <Button variant="outlined" type="submit">Login</Button>
                </form>
                <p className='text-sm m-4'>Don't have an account? <span onClick={handleSignUpClick} className='text-blue-500 cursor-pointer'>Sign Up</span></p>
            </div>
        </div>
    );
}

export default Login;
