import { useEffect,useState } from "react"
import { API_BASE } from "../lib/config"

export default function TerrariumDetail({terrariumId}:any){

  const [terrarium,setTerrarium] = useState<any>(null)

  async function load(){

    const res = await fetch(`${API_BASE}/api/terrariums/${terrariumId}`)

    const data = await res.json()

    setTerrarium(data)

  }

  useEffect(()=>{
    load()
  },[])

  if(!terrarium) return <div>Loading...</div>

  return(

    <div>

      <h2>{terrarium.name}</h2>

      <p>Species : {terrarium.species}</p>

      <p>Sensor : {terrarium.sensor_id}</p>

      <p>Temperature : {terrarium.last_temperature ?? "--"}°C</p>

      <p>Humidity : {terrarium.last_humidity ?? "--"}%</p>

    </div>

  )
}