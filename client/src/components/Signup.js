import React, { useState } from 'react';
import { Button, TextField } from '@mui/material';
import axios from 'axios';
import "./Login.css"; // Assuming you want separate CSS for signup
import { useNavigate } from 'react-router-dom';

function Signup() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('http://localhost:5008/user/register', {
                name: username,
                email,
                password
            });
            // Save token or handle successful registration
            localStorage.setItem('token', data.token);
            navigate('/app');
        } catch (err) {
            setError(err.response ? err.response.data.message : 'Something went wrong');
        }
    };

    const handleLoginClick = () => {
        navigate('/');
    };

    return (
        <div className="login-container">
            <div className="image-container flex-col">
            <h3 className=" text-teal-400 text-5xl font-bold my-16">{`<Bid Engine />`}</h3>
                <h4 className='text-slate-400 text-2xl font-bold mx-8'>Create and place bids...</h4>
            </div>
            <div className="login-box">
                <p className='text-3xl m-4'>Create your Account</p>
                <form onSubmit={handleSubmit}>
                    <TextField
                        id="email-input"
                        label="Enter Email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        id="username-input"
                        label="Enter Username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        id="password-input"
                        label="Enter Password"
                        type="password"
                        autoComplete='new-password'
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {error && <p className="error-message">{error}</p>}
                    <Button variant="outlined" type="submit">Sign Up</Button>
                </form>
                <p className='text-sm m-4'>Already have an account? <span onClick={handleLoginClick} className='text-blue-500'>Login</span></p>
            </div>
        </div>
    );
}

export default Signup;
