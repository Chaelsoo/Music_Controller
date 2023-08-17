import React from "react"
import { useState } from "react";
import { ToggleButton } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";




function CreateRoom(){
    const navigate = useNavigate();
    const [guestcanpause,setGuest] = useState(null);
    const [votestoskip,setVotes] = useState(1);

    const handleVotesChange = (event) => {
      const newValue = parseInt(event.target.value, 10) || votestoskip;
      setVotes(Math.max(1, newValue));
    };

    const create = function (event){
      const request_options = {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          votes_to_skip:votestoskip,
          guest_can_pause:guestcanpause,
        })
      };
      fetch("/api/Create-room/",request_options).then((Response)=>{ return Response.json()
      }).then((data)=>{
      navigate(`/room/${data.code}`)})
    }

    return(
        <div>
          <h4> Guest Priveleges </h4>
          <hr></hr>
          <ToggleButton
            type="checkbox"
            variant="outline-danger"
            value="1"
            checked={guestcanpause === true}
            onClick={() => setGuest(true)}
          >
         Can Pause </ToggleButton>

          <ToggleButton
            variant="outline-primary"
            type="checkbox"
            value="1"
            checked={guestcanpause === false}
            onClick={() => setGuest(false) }
          >
          No Control
          </ToggleButton>
          <br></br>
          <br></br>

        <div>
          <h4> Votes To Skip </h4>
          <hr></hr>
          <input
          className="votes"
          type="number"
          id="votesToSkip"
          name="votesToSkip"
          required
          value={votestoskip}
          min="1"
          onChange={handleVotesChange}
          style={{ textAlign: 'center' }}
        />
        </div>
        <div className="create"> 
        <Button variant="light" onClick={create}>Create Room</Button>
        <Link to='/'> <Button variant="danger"> Back </Button> </Link>
        
        </div>
        </div>
        
        


      
        
    )
}

export default CreateRoom;