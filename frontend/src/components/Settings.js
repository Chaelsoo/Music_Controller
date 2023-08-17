
import React, { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Alert, Button, ToggleButton  } from  "react-bootstrap"



function Settings(){

    const location = useLocation()
    const navigate = useNavigate()

    
    const [guestcanpause,setGuest] = useState(null);
    const [votestoskip,setVotes] = useState(1);
    const [error,setError] = useState('');
    const [success,setSuccess] = useState('');
    const roomcode = useParams().roomcode;


    useEffect(() => {
      async function GetRoomData() {
        try {
          const response = await fetch(`/api/join-room/${roomcode}/`, { method: "GET" });
          if (!response.ok) {
            console.error("There was an error getting that room's info.");
            return;
          }
          const data = await response.json();
          if (!data.is_host){
            navigate(`/room/${roomcode}`)
          }

          setGuest(data.guest_can_pause);
          setVotes(data.votes_to_skip);


        } catch (error) {
          console.error(error);
        }
      }
  
      GetRoomData();
    }, [roomcode]);


    function back(){
        navigate(`/room/${roomcode}`);
    }
    
        const save = async (e) => {
            e.preventDefault();
        
            const requestOptions = {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: roomcode,
                guest_can_pause: guestcanpause,
                votes_to_skip: votestoskip,
              }),
            };
        
            try {
              const response = await fetch(`/api/update-room/`, requestOptions);
              if (!response.ok) {
                setError(" Request was Invalid ");
                return;
              }

              setSuccess(" Room Updated ");
                
            } catch (error) {
              console.error("Error:", error);
            }
          };    // const is_host = queryParams.get("data") === "true";
    

return (
    <div>
    
      {error !== "" ? (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      ) : null}
      {success !== "" ? (
        <Alert variant="success" onClose={() => setSuccess("")} dismissible>
          {success}
        </Alert>
      ) : null}
    
    <form onSubmit={save}>
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

       <h4> Votes To Skip </h4>
          <hr></hr>
          <input
          className="votes"
          type="number"
          id="votesToSkip"
          name="votesToSkip"
          value={votestoskip}
          min="1"
          onChange={(event)=>setVotes(event.target.value)}
          style={{ textAlign: 'center' }}
        />
    <Button type="submit"> Save New Settings </Button>
    <Button variant="danger" onClick={back}> Back </Button> 

     </form> 
    </div>
)
}
export default Settings