
import React from "react"
import { useEffect } from "react"
import { Button } from "react-bootstrap"
import { useNavigate } from "react-router-dom"


function Home(){
const navigate = useNavigate()




useEffect(() => {
    fetch("api/UserInRoom",{method:'GET'}).then((response)=> response.json()).then((data)=>{
    
    if (data.code !=null){
        navigate(`/room/${data.code}`)
    }
    }).catch((error)=>{
        console.log("Error fetching room : ",error)
    })

    },[]);



return(
<div>
    <h1> Welcome to the Home Page </h1>
    <hr></hr>
     <Button variant="primary" onClick={()=> navigate(`/join/`)}> Join a Room </Button>

<Button variant="warning" onClick={()=> navigate(`/create/`)}> Create a Room </Button>
 </div>
)

}

export default Home