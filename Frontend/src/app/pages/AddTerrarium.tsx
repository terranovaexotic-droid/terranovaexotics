import { useState } from "react"
import { API_BASE } from "../lib/config"

export default function AddTerrarium(){

  const [name,setName] = useState("")
  const [species,setSpecies] = useState("")
  const [sensor,setSensor] = useState("")

  async function createTerrarium(){

    await fetch(`${API_BASE}/api/terrariums`,{

      method:"POST",

      headers:{
        "Content-Type":"application/json"
      },

      body:JSON.stringify({
        name:name,
        species:species,
        sensor_id:sensor
      })

    })

    alert("Terrarium created")

    setName("")
    setSpecies("")
    setSensor("")
  }

  return(

    <div>

      <h2>Add Terrarium</h2>

      <input
      placeholder="Name"
      value={name}
      onChange={(e)=>setName(e.target.value)}
      />

      <br/>

      <input
      placeholder="Species"
      value={species}
      onChange={(e)=>setSpecies(e.target.value)}
      />

      <br/>

      <input
      placeholder="Sensor ID"
      value={sensor}
      onChange={(e)=>setSensor(e.target.value)}
      />

      <br/>

      <button onClick={createTerrarium}>
        Create
      </button>

    </div>
  )
}