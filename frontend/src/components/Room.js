import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge, Button, ProgressBar } from "react-bootstrap";
import { FaPlay, FaPause , FaStepForward } from 'react-icons/fa';



function Room() {
  const { roomcode } = useParams();
  const [spotifyAuthenticated,setAuth] = useState(false);
  const [data, setData] = useState(null);
  const [guestcanpause, setGuest] = useState(true);
  const [votestoskip, setVotes] = useState(1);
  const [is_host,setIs] = useState(false);
  const [host,setHost] = useState('');
  const navigate = useNavigate();
  const [song,setSong] = useState({});

  useEffect(() => {
    getSong(); 

    const interval = setInterval(getSong, 1000);

  
    return () => {
      clearInterval(interval); 
    };
  }, []); 

  useEffect(() => {


      async function getRoomData() {
        const request_options = {
          method: "GET",
        };
        try {
          const response = await fetch(`/api/join-room/${roomcode}`, request_options);
          if (!response.ok) {
            console.error("Bad Response:", response.status);
            return;
          }
          const data = await response.json();
          setData(data);
          setGuest(data.guest_can_pause);
          setVotes(data.votes_to_skip);
          setIs(data.is_host);
          setHost(data.host);
          if (data.is_host) {
            authenticateSpotify();
          }
        } catch (error) {
          console.error("Error:", error);
        }
      }

      getRoomData();
    }, [roomcode]);

    function authenticateSpotify() {
      fetch('/spotify/is-authenticated')
        .then((response) => response.json())
        .then((data) => {
          setAuth(data.status);
          if (!data.status) {
            fetch('/spotify/get-auth/')
              .then((response) => response.json())
              .then((data) => {
                window.location.replace(data.url);
              });
          }
        });
    };

    function pauseSong(){
      console.log('im paused ');
      const request_options={
        method:'PUT',
        headers:{'Content-Type':'applications/json'},
      };
      fetch('/spotify/pause/',request_options).catch((error)=>console.log('you dont have premium haha'))
    }


    function Skip(){
      console.log('im skipped ');
      const request_options={
        method:'POST',
        headers:{'Content-Type':'applications/json'},
      };
      fetch('/spotify/skip/',request_options).catch((error)=>console.log('you dont have premium haha'))
    }


    function playSong(){
      console.log('im playing ');
      const request_options={
        method:'PUT',
        headers:{'Content-Type':'applications/json'},
      };
      fetch('/spotify/play/',request_options).catch((error)=>console.log('you dont have premium haha'))
    }


  if (!data) {
    return <p>Loading...</p>;
  };
  function red(){
    localStorage.removeItem('spotifyAuthenticated');
    fetch('/api/leave-room/',{method:'POST', headers:{'Content-type':'application/json'}}).then((response)=>navigate('/'));
  }

  function settings(){
    navigate(`settings/`);
  }

  function getSong() {
    fetch('/spotify/current-song/')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setSong(data);
      })
      .catch((error) => {
        console.error('Error fetching song data:', error);
        setSong({}); 
      });
  }
  
  const SongProgress = (song.time / song.duration) * 100
  return (
    <div>
      {/* <h3>Room Code <Badge bg="dark" text="light"> {roomcode} </Badge> </h3>
      <h3>Guest Can Pause <Badge bg="dark" text="light">{guestcanpause ? "Yes" : "No"} </Badge></h3>
      <h3>Votes to Skip <Badge bg="dark" text="light">{votestoskip} </Badge> </h3>
      <h3> Host Session <Badge bg="dark" text="light"> {host}   </Badge>    </h3>
      <h3> User Status <Badge bg="dark" text="light"> {is_host ? "Host" : "Guest"} </Badge></h3> */}
      <center>

      <h4> Room  <Badge bg='secondary'> {roomcode} </Badge></h4>
      {song.image_url ? <img  src={song.image_url} height="70%" alt=' '></img> : <h1><Badge bg='secondary' > Go To Spotify </Badge> </h1>}
        <br></br> 
      <h3>
      <Badge bg='dark' text='light'> {song.title} </Badge>
      </h3>

      <h4>  <Badge bg='secondary' > {song.artist} </Badge></h4> 
      </center> 
      <ProgressBar now={SongProgress} ></ProgressBar>
       
       <br></br>
      
   <Button variant='light' size="lg" onClick={()=>{ song.is_playing ? pauseSong() : playSong()}} className={guestcanpause ? 'd-inline' : 'd-none'}> {song.is_playing ? <FaPause  /> : <FaPlay/>} </Button>
   <Button variant='light' size="lg" onClick={()=>{Skip()}} className={is_host ? 'd-inline' : 'd-none'}> <FaStepForward/> </Button>

      
      <Button onClick={()=>{Skip()}} className={is_host ?  'd-none' : 'd-inline'}> <Badge> Vote To Skip  </Badge> </Button>
      <br></br><br></br>
      <Badge> Current Vote Count {song.votes}</Badge>
      <Badge bg='danger'> Votes Required {song.votes_required}</Badge>
      
      <br></br>
      

      
      <br></br>


      <Button variant="primary" onClick={settings} className={is_host ? 'd-block' : 'd-none'}> Edit Room </Button>
      <hr></hr>
      <Button variant="danger" onClick={red} > Leave Room  </Button>
    </div>
  );
}

export default Room;
