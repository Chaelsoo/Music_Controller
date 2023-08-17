
import React from "react";
import RoomJoin from "./RoomJoin"
import CreateRoom from "./CreateRoom"
import Room from "./Room"
import Home from "./Home"
import Settings from "./Settings";
import { BrowserRouter as Router , Routes , Route , Link , Redirect } from "react-router-dom";


function Road(){
return(

    <Router>
      <Routes>
        <Route exact path="/" element={<Home/>}/>
        <Route path="/join/" element={<RoomJoin />} />
        <Route path="/create/" element={<CreateRoom />} />
        <Route path="/room/:roomcode/" element={<Room />}/>
        <Route path="/room/:roomcode/settings/" element={<Settings />} />
      </Routes>
    </Router>

)
}




export default Road;