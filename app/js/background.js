'use strict'

let pngs
$.getJSON(chrome.extension.getURL('data/weather.json'), data => {
  pngs = data
})

function getWeatherPNG(type) {
  for (let x in pngs) {
    if (type === pngs[x]) {
      return x
    }
  }
  for (let x in pngs) {
    if (pngs[x].indexOf(type) !== -1) {
      return x
    }
  }
  return 'shouye'
}

function getNotificationId() {
  var id = Math.floor(Math.random() * 9007199254740992) + 1;
  return id.toString()
}

function idToName(json) {
  let endObj = {}
  for (let x in json) {
    json[x].forEach(item => {
      let areas = item['市']
      areas.forEach(area => {
        if (!endObj[area['编码']]) {
          endObj[area['编码']] = area['市名']
        }
      })
    })
  }
  return endObj
}

function fetch(url, code) {
  let msg
  $.ajax({
    url: [url, code].join(''),
    async: false,
    dataType: 'json',
    success: (res, status, jqXHR) => {
      msg = res.data
     // console.log(msg)
    },
    error: function(jqXHR, textStatus, errorMsg){
      chrome.notifications.create(bg.getNotificationId(), {
        type: "basic",
        iconUrl: '../images/weather.png',
        title: 'error',
        message: errorMsg
      })
    } 
  })
  return msg
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get('currentCity', (data) => {
    let currentCity = data.currentCity
    if (!currentCity) {
      chrome.storage.sync.set({currentCity: {101010100: '北京'}}, () => {
        console.log('The default city iS BeiJing')
      });
    }
  })
})

function setNotify() {
  let sched = later.parse.recur()
    .on(10, 18).hour()

  let tipHigh = 35
  let tipLow = 15
  let tipWin = 5

  let timer = later.setInterval(() => {
    chrome.storage.sync.get('currentCity', data => {
      let currentCity = data.currentCity
      let url = 'http://wthrcdn.etouch.cn/weather_mini?citykey='
      let code = Object.keys(currentCity)[0]
      let msg = fetch(url, code)
      msg = msg.forecast[1]
      let fengli = msg.fengli.slice(3).split('[')[1].split(']')[0]
      let tip = '明天'

      if (parseInt(msg.high.slice(3), 10) >= tipHigh) {
        tip += `最高气温将突破${parseInt(msg.high.slice(3), 10)}℃~\n`
      }
      if (parseInt(msg.low.slice(3), 10) <= tipLow) {
        tip += `最低气温将低于${parseInt(msg.low.slice(3), 10)}℃~\n`
      }
      if (msg.type.indexOf('雨') !== -1
        || msg.type.indexOf('雪') !== -1
        || msg.type.indexOf('霾') !==-1
        || msg.type.indexOf('沙') !==-1
        || msg.type.indexOf('冰') !==-1) {
        tip += `将有${msg.type}~\n`
      }
      let level = parseInt(fengli.split('').reverse()[1], 10)
      if ( level >= tipWin) {
        tip += `最大风力将达到${level}级~\n`
      }
      if (tip !== '明天') {
        tip += '请注意保护好自己哟~'
        chrome.notifications.create(getNotificationId(), {
          type: "basic",
          iconUrl: '../images/weather.png',
          title: '温馨提示',
          message: tip
        })
      }
    })
  }, sched)
}

setNotify()
