let bluetoothDevice;
let bluetoothServer;
let bluetoothCharacteristic;

const clickSound = document.getElementById('clickSound');

function playClickSound() {
  if (clickSound) {
    clickSound.currentTime = 0; // Reset waktu pemutaran ke awal
    clickSound.play();
  }
}

function triggerButtonEffect(button) {
  if (button) {
    playClickSound();
    button.classList.add('clicked');
    setTimeout(() => {
      button.classList.remove('clicked');
    }, 200); // Durasi animasi shake di CSS
  }
}

async function connectBluetooth() {
  const button = document.querySelector('button[onclick="connectBluetooth()"]');
  triggerButtonEffect(button);
  try {
    bluetoothDevice = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true, // Jika Anda tahu UUID, Anda bisa menggunakan 'filters' untuk lebih spesifik
      optionalServices: ['battery_service']
    });

    bluetoothServer = await bluetoothDevice.gatt.connect();
    const services = await bluetoothServer.getPrimaryServices();
    
    console.log('Connected to Bluetooth device.');
    for (const service of services) {
      console.log('Service UUID:', service.uuid);
      const characteristics = await service.getCharacteristics();
      for (const characteristic of characteristics) {
        console.log('Characteristic UUID:', characteristic.uuid);
      }
    }
    
    // Ganti 'your-characteristic-uuid' dengan UUID karakteristik yang relevan
    const characteristicUuid = 'your-characteristic-uuid'; 
    bluetoothCharacteristic = await services[0].getCharacteristic(characteristicUuid);
  } catch (error) {
    console.error('Error connecting to Bluetooth device:', error);
  }
}

async function readUUIDs() {
  const button = document.querySelector('button[onclick="readUUIDs()"]');
  triggerButtonEffect(button);
  if (!bluetoothServer) {
    console.warn('Not connected to any Bluetooth device.');
    return;
  }

  try {
    const services = await bluetoothServer.getPrimaryServices();
    const uuidList = document.getElementById('uuidList');
    if (uuidList) {
      uuidList.innerHTML = '<h2>Service UUIDs:</h2>';
      
      for (const service of services) {
        uuidList.innerHTML += `<p>Service UUID: ${service.uuid}</p>`;
        const characteristics = await service.getCharacteristics();
        uuidList.innerHTML += '<h3>Characteristics:</h3>';
        
        for (const characteristic of characteristics) {
          uuidList.innerHTML += `<p>Characteristic UUID: ${characteristic.uuid}</p>`;
        }
      }
    }
    console.log('UUIDs read successfully.');
  } catch (error) {
    console.error('Error reading UUIDs:', error);
  }
}

async function sendCommand(command) {
  const button = document.querySelector(`button[onclick="sendCommand('${command}')"]`);
  triggerButtonEffect(button);
  if (!bluetoothCharacteristic) {
    console.warn('Not connected to any Bluetooth device.');
    return;
  }

  try {
    const encoder = new TextEncoder();
    await bluetoothCharacteristic.writeValue(encoder.encode(command));
    console.log('Command sent:', command);
  } catch (error) {
    console.error('Error sending command:', error);
  }
}