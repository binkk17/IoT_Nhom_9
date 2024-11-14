let objectWeather = {
  id: 21,
  cityid: '',
  appid: '',
  units: 'metric',
  containerid: 'openweathermap-widget-21',
}

let setupWeather = () => {
  window.myWidgetParam = []
  window.myWidgetParam.push(objectWeather)
  loadWeatherScript()
}


let updateWeather = (newCityId, newAppId) => {
  objectWeather.cityid = newCityId
  objectWeather.appid = newAppId

  const container = document.getElementById(objectWeather.containerid)
  if (container) {
    container.innerHTML = ''
  }

  setupWeather()
}

let loadWeatherScript = () => {
  const existingScript = document.querySelector('script[src="//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js"]')
  
  if (existingScript) {
    existingScript.remove()
  }

  const script = document.createElement('script')
  script.async = true
  script.charset = 'utf-8'
  script.src = '//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js'
  
  const s = document.getElementsByTagName('script')[0]
  s.parentNode.insertBefore(script, s)
}

setupWeather()

