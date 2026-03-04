import { useEffect, useState } from "react"
import { API_BASE } from "../lib/config"

export default function TerrariumsList() {

  const [terrariums,setTerrariums] = useState([])

  async function loadTerrariums(){
    const res = await fetch(`${API_BASE}/api/terrariums`)
    const data = await res.json()
    setTerrariums(data)
  }

  async function deleteTerrarium(id:number){
    await fetch(`${API_BASE}/api/terrariums/${id}`,{
      method:"DELETE"
    })

    loadTerrariums()
  }

  useEffect(()=>{
    loadTerrariums()
  },[])

  return (
    <div>

      <h2>Terrariums</h2>

      {terrariums.map((t:any)=>(
        <div key={t.id} style={{border:"1px solid #333",padding:10,marginBottom:10}}>

          <h3>{t.name}</h3>

          <p>Sensor : {t.sensor_id}</p>

          <p>Temp : {t.last_temperature ?? "--"}°C</p>

          <p>Humidity : {t.last_humidity ?? "--"}%</p>

          <button onClick={()=>deleteTerrarium(t.id)}>
            Delete
          </button>

        </div>
      ))}

    </div>
  )
}