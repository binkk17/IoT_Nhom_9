const clientId = 'web_' + Math.random().toString(16).substr(2, 8)
const mqttServer = 'wss://d719acaa6edb43049323600c93163977.s1.eu.hivemq.cloud:8884/mqtt'
const options = {
    clientId: clientId,
    username: 'hivemq.webclient.1731232619432',
    password: 'Lz41Z0A!q*;3hGRtkaB#',
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
      document.querySelector('.temparature-value').innerText = `${data.temperature}`
      document.querySelector('.soilMoisture-value').innerText = `${data.soil_moisture}`
      document.querySelector('.light-value').innerText = `${data.lux}`
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
          

        document.getElementById('temperatureThreshold').value = data.temperature
        document.getElementById('temperatureValue').innerText = data.temperature
          

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
  document.getElementById('temperatureThreshold').addEventListener('input', (e) => {
      document.getElementById('temperatureValue').innerText = e.target.value
  })
  document.getElementById('luxThreshold').addEventListener('input', (e) => {
      document.getElementById('luxValue').innerText = e.target.value
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
        // document.querySelector("#notificationMessage").innerHTML = "Vui lòng điền thời gian !"
        // showNotification()
        // pumpToggle.checked = false
          document.querySelector("#timePour").value = "30"
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








