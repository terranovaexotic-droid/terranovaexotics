import { useEffect, useState } from "react";
import { WS_URL } from "../lib/config";

export default function Sensors() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);

      if (msg.type === "reading") {
        setData(msg);
      }
    };

    return () => ws.close();
  }, []);

  if (!data) return <div>Capteur en attente...</div>;

  return (
    <div>
      <h3>Capteur {data.sensor_id}</h3>
      <p>Température : {data.temperature}°C</p>
      <p>Humidité : {data.humidity}%</p>
    </div>
  );
}