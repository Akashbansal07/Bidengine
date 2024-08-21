import { Route, Routes } from 'react-router-dom';
import './App.css'
import Login from './components/Login';
import MainContainer from './components/MainContainer';
import Welcome from './components/Welcome';
import BidArea from './components/BidArea';
import Notifications from './components/Notifications';
import CreateBidGroups from './components/CreateBidGroups';
import User_groups from './components/User_groups';
import Signup from './components/Signup';


function App() {
  return (
    <div className="App">
      {/* <MainContainer /> */}
      {/* <Login /> */}
      <Routes>
        <Route path="/" element={<Login/>} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/app" element={<MainContainer/>} >
               <Route path='welcome' element={<Welcome/>}></Route>
               <Route path='bids' element={<BidArea/>}></Route>
               <Route path='notification' element={<Notifications/>}></Route>
               <Route path='create-bid' element={<CreateBidGroups/>}></Route>
               <Route path='user' element={<User_groups/>}></Route>
        </Route>
      </Routes>
    </div>
  );
}

export default App;
