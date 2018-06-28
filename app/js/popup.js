'use strict'

let cityCode
let bg = chrome.extension.getBackgroundPage()

$.getJSON(chrome.extension.getURL('data/cityCode.json'), data => {
  cityCode = bg.idToName(data)
})

function render() {
  chrome.storage.sync.get('currentCity', data => {
    let currentCity = data.currentCity
    let tag = '℃'
    let url = 'http://wthrcdn.etouch.cn/weather_mini?citykey='
    let code = Object.keys(currentCity)[0]
    let msg = bg.fetch(url, code)

    if (msg) {
      let forecast = msg.forecast
      let temp = msg.wendu
      let city = msg.city
      let tip = msg.ganmao 

      let right = $('.right')
      let left = $('.left')
      forecast.forEach((item, i) => {
        let iconType = bg.getWeatherPNG(item.type)
        let fengli = item.fengli.slice(3).split('[')[1].split(']')[0]
        let forecastHtml = ''

        if (i === 0) {
          let date = ((new Date).getMonth()+1) + '月' + item.date
          forecastHtml += `
          <div class="left">
            <i class="icon wth-iconfont icon-${iconType}"></i>
            <p>${item.type}</p>
            <p>${city}</p>
          </div>
          <div class="right">
            <marquee behavior="scroll">${tip}</marquee>
            <p>${date}</p>
            <p>温度 ${[temp, tag].join('')}</p>
            <p>${item.fengxiang}</p>
            <p>风力 ${fengli}</p>
            <p>${item.high}</p>
            <p>${item.low}</p>
          </div>`
        } else {
          let date = item.date.split('').reverse().slice(0,3).reverse().join('')
          forecastHtml += `
          <div class="forecast">
            <i class="icon wth-iconfont icon-${iconType}"></i>
            <p>${item.type}</p>
            <p>${date}</p>
            <p>${item.fengxiang}</p>
            <p>风力 ${fengli}</p>
            <p>${item.high}</p>
            <p>${item.low}</p>
          </div>`
        }
        $('#w'+i).empty().append($(forecastHtml))
        $('.forecast').css({animation: 'show-forecast 2s'})
      })
    } else {
      chrome.notifications.create(bg.getNotificationId(), {
        type: "basic",
        iconUrl: '../images/weather.png',
        title: '提示',
        message: '当前网络缓慢，请再次尝试...'
      })
    }
  })
}

$(() => {
  render()

  let ul = $('.tipText')

  $('.form-control').keyup(() => {
    let val = $('.form-control').val().replace(/^\s+|\s+$/g, '')
    let list = {}
    if (val) {
      for (let x in cityCode) {
        if (cityCode[x].indexOf(val) !== -1) {
          list[x] = cityCode[x]
        }
      }
    }
    if (!$.isEmptyObject(list)) {
      chrome.storage.sync.set({list})
      let liHtml = ''
      for (let [key, value] of Object.entries(list)) {
        liHtml += '<li>' + value + '</li>'
      }
      liHtml && ul.empty() && $(liHtml).appendTo(ul)
      ul.css({'display': 'block'})
    } else {
      ul.empty() && $('<p>&nbsp;&nbsp;无相关数据</p>').appendTo(ul)
      ul.css({'display': 'block'})
    }
  })

  $('.form-control').focus(() => {
    $('.form-control').val().replace(/^\s+|\s+$/g, '') &&
    ul.css('display') === 'none' &&
    ul.css({'display': 'block'})
  })

  $('.content').click(() => {
    ul.css({'display': 'none'})
  })

  ul.on('click', 'li', function() {
    let select = $(this).text()
    $('.form-control').val(select)
    ul.css({'display': 'none'})
    chrome.storage.sync.get('list', data => {
      let list = data.list
      for (let [key, value] of Object.entries(list)) {
        if (value === select) {
          let currentCity = {}
          currentCity[key] = value
          chrome.storage.sync.set({currentCity})
          render()
        }
      }
    })
  })
})
