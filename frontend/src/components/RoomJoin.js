import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";




function RoomJoin() {
  const [pk, setPk] = useState('');
  const [data,setData] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate(`/room/${pk}`);
  };

  return (
    <div>
      <center>
      <form onSubmit={handleSubmit}>
        <label> 
          <br></br>
          <input type="text"  label='code' placeholder="Enter a Room Code" value={pk} onChange={(e) => setPk(e.target.value)} />
        </label>

        <Button variant="primary" size="lg"> Submit </Button>{' '}
        <Link to='/'> <Button variant="danger"> Back  </Button> </Link>
      </form>

      
      </center>
    </div>
  );
}

export default RoomJoin;
