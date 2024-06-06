import React, { useEffect, useState } from 'react';
import './App.css';
import { database, ref, onValue, firestore, collection, getDocs } from './firebase';
import { FaHistory } from 'react-icons/fa';
import Table from 'react-bootstrap/Table'; // Import the Table component from react-bootstrap

function App() {
  const [humidity, setHumidity] = useState(null);
  const [temperature, setTemperature] = useState(null);
  const [previousMeasurements, setPreviousMeasurements] = useState([]);
  const [showTable, setShowTable] = useState(false); // State to manage table visibility

  useEffect(() => {
    console.log("Setting up Firebase references...");
    const humidityRef = ref(database, 'data/humidity');
    const temperatureRef = ref(database, 'data/temperature');
    
    onValue(humidityRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Fetched Humidity:", data);
      setHumidity(data);
    }, (error) => {
      console.error("Error fetching humidity:", error);
    });

    onValue(temperatureRef, (snapshot) => {
      const data = snapshot.val();
      console.log("Fetched Temperature:", data);
      setTemperature(data);
    }, (error) => {
      console.error("Error fetching temperature:", error);
    });
  }, []);

  const fetchPreviousMeasurements = async () => {
    if (!showTable) {
      try {
        const querySnapshot = await getDocs(collection(firestore, "measurements"));
        const measurements = [];
        querySnapshot.forEach((doc) => {
          measurements.push(doc.data());
        });
        setPreviousMeasurements(measurements);
      } catch (error) {
        console.error("Error fetching previous measurements:", error);
      }
    }
    setShowTable(!showTable); // Toggle the visibility
  };

  const formatTimestamp = (timestamp) => {
    if (timestamp && timestamp.seconds) {
      const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
      return date.toLocaleString(); // This will format the date and time in a human-readable form
    }
    return '';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">Smart City</h1>
        <p>
          Humidity: {humidity !== null ? `${humidity}%` : 'Loading...'}
        </p>
        <p>
          Temperature: {temperature !== null ? `${temperature}°C` : 'Loading...'}
        </p>
        <FaHistory className="App-icon" onClick={fetchPreviousMeasurements} style={{ cursor: 'pointer', fontSize: '24px' }} />
        {showTable && (
          <Table striped bordered hover variant="dark" className="mt-4">
            <thead>
              <tr>
                <th>Humidity</th>
                <th>Temperature</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {previousMeasurements.map((measurement, index) => (
                <tr key={index}>
                  <td>{`${measurement.humidity}%`}</td>
                  <td>{`${measurement.temperature}°C`}</td>
                  <td>{formatTimestamp(measurement.timestamp)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </header>
    </div>
  );
}

export default App;
