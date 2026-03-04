import { useEffect,useState } from "react"
import { API_BASE } from "../lib/config"

export default function Sensors(){

  const [readings,setReadings] = useState([])

  async function load(){

    const res = await fetch(`${API_BASE}/api/readings`)

    const data = await res.json()

    setReadings(data)

  }

  useEffect(()=>{
    load()
  },[])

  return(

    <div>

      <h2>Sensor Readings</h2>

      {readings.map((r:any)=>(
        <div key={r.id}>

          {r.sensor_id} — {r.temperature}°C — {r.humidity}%

        </div>
      ))}

    </div>

  )
}