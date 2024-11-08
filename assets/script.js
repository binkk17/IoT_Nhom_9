const clientId = 'web_' + Math.random().toString(16).substr(2, 8)
const mqttServer = 'wss://3e4da737977745718c1b1e75b7853090.s1.eu.hivemq.cloud:8884/mqtt'
const options = {
    clientId: clientId,
    username: 'hivemq.webclient.1731049931938',
    password: 'y05$VSxal2uTOA1;>Dw*',
    clean: true
}
const client = mqtt.connect(mqttServer, options)

const showNotification = ()=> {
  const notification = document.getElementById('notification')
  notification.classList.add('show')
  setTimeout(() => {
    closeNotification()
  }, 3000)
}

const closeNotification=()=>{
  const notification = document.getElementById('notification')
  notification.classList.remove('show')
}

client.on('connect', () => {
    console.log('Connected to MQTT broker')
    client.subscribe('esp8266/sensors')
    client.subscribe('esp8266/thresholds')  
    client.subscribe('esp8266/weather')
})

client.on('error', (err) => {
    console.error('Connection error: ', err)
})

client.on('message', (topic, message) => {
    const data = JSON.parse(message.toString())
    if (topic === 'esp8266/sensors') {
      // Thay đổi từ temperature sang nhiệt độ từ DHT11
      document.querySelector('.temparature-value').innerText = `${data.temperature_dht11}` // Giả sử tên trường là temperature_dht11

      // Thay đổi từ lux sang giá trị từ cảm biến LDR
      document.querySelector('.light-value').innerText = `${data.ldr_value}` // Giả sử tên trường là ldr_value
      
      if(data.pourState=="1"){

        pumpToggle.checked = false
      }
      else{
        pumpToggle.checked = true
      }
      if(data.mode == 'manual'){
        document.querySelector("#modeToggle").value = 'manual' 
        document.querySelector('.manual-control').classList.remove("d-none")
      }
      if(document.querySelector("#timePour").value=='') document.querySelector("#timePour").value = data.timePour/60000
      if(document.querySelector("#api-weather").value=='') document.querySelector("#api-weather").value = data.apiWeather
      if(document.querySelector("#id-weather").value=='') document.querySelector("#id-weather").value = data.idCity
      // document.querySelector('.temparature-value').innerText = `${data.temperature}`
      // Xử lý dữ liệu từ DHT11
      const temperature = parseFloat(data.temperature).toFixed(1) // Làm tròn 1 chữ số thập phân
      document.querySelector('.temparature-value').innerText = temperature

      document.querySelector('.soilMoisture-value').innerText = `${data.soil_moisture}`
      // document.querySelector('.light-value').innerText = `${data.lux}`

      // Chuyển đổi giá trị analog từ LDR (0-1023) thành giá trị ánh sáng (lux)
      const rawLightValue = parseInt(data.lux)
      // const lightValue = Math.round((rawLightValue / 1023) * 100) // Chuyển đổi thành phần trăm
      // document.querySelector('.light-value').innerText = lightValue  
      const lightText = (rawLightValue / 1023) * 100 > 50 ? 'Tối' : 'Sáng'
      document.querySelector('.light-value').innerText = lightText    
      document.querySelector('.pop-value').innerText = `${data.rainProbability}`
      if(data.pourState=="1"){
        document.querySelector(".current-state .pump .value").innerText = "Tắt"
        document.querySelector(".current-state .pump .value").className = "value off"
      }
      else{
        document.querySelector(".current-state .pump .value").innerText = "Đang bật"
        document.querySelector(".current-state .pump .value").className ="value on"
      }
      if(data.apiWeather != objectWeather.appid){
        updateWeather(data.idCity, data.apiWeather)
      }
      if(data.idCity != objectWeather.cityid){
        updateWeather(data.idCity, data.apiWeather)
      }
      
    } 
    else if (topic === 'esp8266/thresholds') {
        document.getElementById('soilMoistureThresholdMin').value = data.soil_moisture_min
        document.getElementById('soilMoistureMinValue').innerText = data.soil_moisture_min
          
        // // Nếu có thay đổi về ngưỡng cho DHT11 và LDR
        // document.getElementById('temperatureThreshold').value = data.temperature_dht11
        // document.getElementById('temperatureValue').innerText = data.temperature_dht11
          

        // document.getElementById('luxThreshold').value = data.ldr_threshold
        // document.getElementById('luxValue').innerText = data.ldr_threshold
          
        // Ngưỡng nhiệt độ từ DHT11
        document.getElementById('temperatureThreshold').value = data.temperature
        document.getElementById('temperatureValue').innerText = data.temperature

        // Ngưỡng ánh sáng từ LDR
        document.getElementById('luxThreshold').value = data.lux
        document.getElementById('luxValue').innerText = data.lux        
        document.getElementById('rainThreshold').value = data.rain
        document.getElementById('rainValue').innerText = data.rain
          

        document.getElementById('soilMoistureThresholdMax').value = data.soil_moisture_max
        document.getElementById('soilMoistureMaxValue').innerText = data.soil_moisture_max
          
        document.querySelector(".current_threshold .current_threshold_soid_moisture_min .value").innerText = data.soil_moisture_min
        document.querySelector(".current_threshold .current_threshold_temp .value").innerText = data.temperature
        document.querySelector(".current_threshold .current_threshold_lux .value").innerText = data.lux
        document.querySelector(".current_threshold .current_pop .value").innerText = data.rain
        document.querySelector(".current_threshold .current_threshold_soid_moisture_max  .value").innerText = data.soil_moisture_max      
      }
})

  document.getElementById('soilMoistureThresholdMin').addEventListener('input', (e) => {
    document.getElementById('soilMoistureMinValue').innerText = e.target.value
  })
  document.getElementById('soilMoistureThresholdMax').addEventListener('input', (e) => {
    document.getElementById('soilMoistureMaxValue').innerText = e.target.value
  })
  // document.getElementById('temperatureThreshold').addEventListener('input', (e) => {
  //     document.getElementById('temperatureValue').innerText = e.target.value
  // })
  // document.getElementById('luxThreshold').addEventListener('input', (e) => {
  //     document.getElementById('luxValue').innerText = e.target.value
  // })
  document.getElementById('setThresholdButton').addEventListener('click', () => {
    const temperatureThreshold = document.getElementById('temperatureThreshold').value
    const ldrThreshold = document.getElementById('luxThreshold').value
    
    const thresholds = {
        temperature_dht11: parseInt(temperatureThreshold),
        ldr_threshold: parseInt(ldrThreshold),
        // Giữ nguyên các ngưỡng khác
        soil_moisture_min: parseInt(soilMoistureThresholdMin),
        soil_moisture_max: parseInt(soilMoistureThresholdMax),
        rain: parseInt(rainThreshold)
    }
    
    // Kiểm tra giá trị hợp lệ
    if (temperatureThreshold < 0 || temperatureThreshold > 50) {
        showNotification('Nhiệt độ phải nằm trong khoảng 0-50°C');
        return;
    }
    
    if (ldrThreshold < 0 || ldrThreshold > 1023) {
        showNotification('Ngưỡng LDR phải nằm trong khoảng 0-1023');
        return;
    }
    
    client.publish('esp8266/thresholds', JSON.stringify(thresholds), { qos: 1, retain: true })
    document.querySelector("#notificationMessage").innerHTML = "Cập nhật thành công !"
    showNotification()
})

  document.getElementById('rainThreshold').addEventListener('input', (e) => {
      document.getElementById('rainValue').innerText = e.target.value
  })


if(document.getElementById('setThresholdButton')){
  document.getElementById('setThresholdButton').addEventListener('click', () => {
    const soilMoistureThresholdMin = document.getElementById('soilMoistureThresholdMin').value
    const soilMoistureThresholdMax = document.getElementById('soilMoistureThresholdMax').value
    const temperatureThreshold = document.getElementById('temperatureThreshold').value
    const luxThreshold = document.getElementById('luxThreshold').value
    const rainThreshold = document.getElementById('rainThreshold').value
    const thresholds = {
        soil_moisture_min: parseInt(soilMoistureThresholdMin),
        soil_moisture_max: parseInt(soilMoistureThresholdMax),
        temperature: parseInt(temperatureThreshold),
        lux: parseInt(luxThreshold),
        rain: parseInt(rainThreshold)
    }
    client.publish('esp8266/thresholds', JSON.stringify(thresholds), { qos: 1, retain: true })
    document.querySelector("#notificationMessage").innerHTML = "Cập nhật thành công !"
    showNotification()
  })
}

const setWeatherButton = document.querySelector("#setWeatherButton")
if(setWeatherButton){
  setWeatherButton.addEventListener("click", ()=>{
    const api = document.querySelector("#api-weather")
    const idCity = document.querySelector("#id-weather")
    client.publish('esp8266/weather', JSON.stringify({api:api.value, idCity: idCity.value}), { qos: 1, retain: true })
    document.querySelector("#notificationMessage").innerHTML = "Cập nhật thành công !"
    showNotification()
  })
}

const wifiButton = document.querySelector("#setWifiButton")
if(wifiButton){
  wifiButton.addEventListener("click", ()=>{
    const name = document.querySelector("#nameWifi")
    const password = document.querySelector("#password")
    client.publish('esp8266/wifi', JSON.stringify({name:name.value, password: password.value}), { qos: 1, retain: true })
    name.value = ""
    password.value = ""
    document.querySelector("#notificationMessage").innerHTML = "Nhấn reset và đợi 5-10 giây!"
    showNotification()
  })
}


if(document.getElementById('modeToggle')){
  document.getElementById('modeToggle').addEventListener('change', (e) => {
    const mode = e.target.value
    if (mode === 'manual') {
        document.querySelector('.manual-control').classList.remove("d-none")
    } else {
        document.querySelector('.manual-control').classList.add("d-none")
    }
    client.publish('esp8266/mode', mode) 
  })

  const pumpToggle = document.getElementById('pumpToggle')
  const pumpStateText = document.getElementById('pumpStateText')

  pumpToggle.addEventListener('change', function(e) {
    if (pumpToggle.checked) {
      const time = document.querySelector("#timePour").value
      if(time=="" || time=="0"){
        document.querySelector("#notificationMessage").innerHTML = "Vui lòng điền thời gian !"
        showNotification()
        pumpToggle.checked = false
      }
      else{
        pumpStateText.textContent = 'ON'
        client.publish('esp8266/manual_control', JSON.stringify({ pump: "on", time: time}))
      }
    } else {
      pumpStateText.textContent = 'OFF'
      client.publish('esp8266/manual_control', JSON.stringify({ pump: "off" }))
    }
  })
}
const pumpToggle = document.getElementById('pumpToggle');
const timePourInput = document.getElementById('timePour');
const pumpStateText = document.getElementById('pumpStateText');
const timeRemaining = document.getElementById('timeRemaining');

let pumpTimer = null;

// pumpToggle.addEventListener('change', function(e) {
//     const isOn = e.target.checked;
//     const timeValue = parseInt(timePourInput.value);

//     // Kiểm tra input thời gian khi bật bơm
//     if (isOn) {
//         if (!timeValue || timeValue < 1 || timeValue > 60) {
//             e.preventDefault();
//             pumpToggle.checked = false;
//             showNotification('Vui lòng nhập thời gian tưới từ 1-60 phút');
//             return;
//         }

//         // Bật bơm
//         pumpStateText.textContent = 'ON';
//         let remainingTime = timeValue;
        
//         // Cập nhật thời gian còn lại
//         timeRemaining.textContent = `(Còn lại: ${remainingTime} phút)`;
        
//         // Gửi lệnh bật bơm qua MQTT
//         client.publish('esp8266/pump/manual', JSON.stringify({
//             state: 'ON',
//             duration: timeValue
//         }));

//         // Đếm ngược thời gian
//         pumpTimer = setInterval(() => {
//             remainingTime--;
//             timeRemaining.textContent = `(Còn lại: ${remainingTime} phút)`;

//             if (remainingTime <= 0) {
//                 clearInterval(pumpTimer);
//                 pumpToggle.checked = false;
//                 pumpStateText.textContent = 'OFF';
//                 timeRemaining.textContent = '';
                
//                 // Gửi lệnh tắt bơm
//                 client.publish('esp8266/pump/manual', JSON.stringify({
//                     state: 'OFF'
//                 }));
//             }
//         }, 60000); // Cập nhật mỗi phút

//     } else {
//         // Tắt bơm
//         clearInterval(pumpTimer);
//         pumpStateText.textContent = 'OFF';
//         timeRemaining.textContent = '';
        
//         // Gửi lệnh tắt bơm
//         client.publish('esp8266/pump/manual', JSON.stringify({
//             state: 'OFF'
//         }));
//     }
// });

// // Validation cho input thời gian
// timePourInput.addEventListener('input', function(e) {
//     let value = parseInt(e.target.value);
//     if (value < 1) this.value = 1;
//     if (value > 60) this.value = 60;
// });

// // Xử lý khi nhận phản hồi từ ESP8266
// client.subscribe('esp8266/pump/status');
// client.on('message', function(topic, message) {
//     if (topic === 'esp8266/pump/status') {
//         const status = JSON.parse(message.toString());
//         if (status.state === 'OFF') {
//             pumpToggle.checked = false;
//             pumpStateText.textContent = 'OFF';
//             timeRemaining.textContent = '';
//             clearInterval(pumpTimer);
//         }
//     }
// });

// // Cleanup khi chuyển mode
// function cleanupPumpTimer() {
//     if (pumpTimer) {
//         clearInterval(pumpTimer);
//         pumpTimer = null;
//     }
//     pumpToggle.checked = false;
//     pumpStateText.textContent = 'OFF';
//     timeRemaining.textContent = '';
// }
function processDHT11Data(temperature) {
  // Kiểm tra nhiệt độ có nằm trong khoảng hợp lý không
  if (temperature < -40 || temperature > 80) {
      console.error('Nhiệt độ DHT11 không hợp lệ');
      return null;
  }
  return temperature;
}
function processLDRData(ldrValue) {
  // Chuyển đổi giá trị LDR sang mức độ ánh sáng
  // LDR thường trả về giá trị ngược: 
  // Giá trị cao = ít ánh sáng
  // Giá trị thấp = nhiều ánh sáng
  const maxLDRValue = 1023; // Giả sử ADC 10-bit
  const lightIntensity = maxLDRValue - ldrValue;
  
  // Chia mức độ ánh sáng
  if (lightIntensity < 100) return 'Rất tối';
  if (lightIntensity < 300) return 'Tối';
  if (lightIntensity < 500) return 'Trung bình';
  if (lightIntensity < 700) return 'Sáng';
  return 'Rất sáng';
}



const listLi = document.querySelectorAll("#sidebar li")
if(listLi){
  listLi.forEach(li=>{
    li.addEventListener("click",()=>{
      if(li.classList.contains("home")){
        document.querySelector(".content1").classList.remove("d-none")
        document.querySelector(".content2").classList.add("d-none")

        document.querySelector("#sidebar li.home").classList.add("LinkBox")
        document.querySelector("#sidebar li.setting").classList.remove("LinkBox")
      }
      else{
        document.querySelector(".content1").classList.add("d-none")
        document.querySelector(".content2").classList.remove("d-none")

        document.querySelector("#sidebar li.home").classList.remove("LinkBox")
        document.querySelector("#sidebar li.setting").classList.add("LinkBox")
      }
    })
  })
}








