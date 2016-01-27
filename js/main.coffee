---
---

"use strict"

BOX_OPEN_DELAY = 300
THREE_PATH = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r73/three.js'
MODERN_CSS_PATH = '/css/style-modern.css'
MODERN_JS_PATH = '/js/cat-3d.js'

enableClosestPolyfill = ->
  closest = (selector) ->
    thisEl = this

    while thisEl
      break if thisEl.matches selector
      thisEl = thisEl.parentElement

    thisEl

  do (el = Element.prototype) ->
    el.matches = el.matches or el.msMatchesSelector
    el.closest = el.closest or closest

insertResource = (url, callback) ->
  if /\.css$/.test url
    el = document.createElement 'link'
    el.setAttribute 'rel', 'stylesheet'
    el.setAttribute 'type', 'text/css'
    el.setAttribute 'href', url

  if /\.js$/.test url
    el = document.createElement 'script'
    el.setAttribute 'src', url

  if el
    document.head.appendChild el
    el.addEventListener 'load', callback

openBox = ({boxEl, index, timers, callback} = {}) ->
  clearTimeout timers["open-#{index}"]

  boxEl.classList.add 'is-open'

  timers["has-opened-#{index}"] = setTimeout ->
    boxEl.classList.add 'has-opened'
    callback() if callback
  , BOX_OPEN_DELAY

closeBox = ({boxEl, index, timers, callback} = {}) ->
  clearTimeout timers["has-opened-#{index}"]

  boxEl.classList.remove 'has-opened'

  timers["open-#{index}"] = setTimeout ->
    boxEl.classList.remove 'has-opened', 'is-open'
    callback() if callback
  , BOX_OPEN_DELAY

closeAllBoxes = ({boxEls, excludeIndex, timers} = {}) ->
  for boxEl, index in boxEls when index isnt excludeIndex
    closeBox
      boxEl: boxEl
      index: index
      timers: timers

applyMouseEvents = (boxEl, index, timers) ->
  boxEl.addEventListener 'mouseenter', (e) ->
    openBox
      boxEl: boxEl
      index: index
      timers: timers

  boxEl.addEventListener 'mouseleave', (e) ->
    closeBox
      boxEl: boxEl
      index: index
      timers: timers

applyTouchEvents = ({boxEl, boxEls, index, timers} = {}) ->
  boxEl.addEventListener 'click', (e) ->
    return unless window.innerWidth >= 768
    return if boxEl.classList.contains 'has-opened'

    e.preventDefault()

    openBox
      boxEl: boxEl
      index: index
      timers: timers

    closeAllBoxes
      boxEls: boxEls
      excludeIndex: index
      timers: timers

applyEvents = ->
  boxEls = document.querySelectorAll '.box-list li'
  timers = {}

  document.addEventListener 'click', (e) ->
    return unless window.innerWidth >= 768
    return if e.target.closest '.box'

    closeAllBoxes
      boxEls: boxEls
      timers: timers

  if Modernizr.touchevents then for boxEl, index in boxEls
    applyTouchEvents
      boxEl: boxEl
      boxEls: boxEls
      index: index
      timers: timers
  else
    applyMouseEvents boxEl, index, timers for boxEl, index in boxEls

playIntro = ->
  fall = (objectEl) ->
    delay = 1000 + Math.floor(Math.random() * 500)

    setTimeout ->
      objectEl.classList.add 'has-fallen'
    , delay

  axesEl = document.getElementById 'js-axes'
  objectEls = document.querySelectorAll '.js-fall'

  setTimeout ->
    axesEl.classList.add 'is-done'
  , 100

  fall objectEl for objectEl in objectEls

adjustAxesHeight = (axesContainerEl) ->
  axesContainerEl.style.height = ''
  return unless window.innerWidth >= 768
  axesContainerEl.style.height = "#{document.documentElement.scrollHeight}px"

initModern = (axesContainerEl) ->
  return unless window.innerWidth >= 768
  return if document.documentElement.classList is undefined
  return if document.documentElement.onmouseenter is undefined
  return if document.documentElement.onmouseleave is undefined

  enableClosestPolyfill()
  applyEvents()
  insertResource THREE_PATH, -> insertResource MODERN_JS_PATH
  insertResource MODERN_CSS_PATH, ->
    playIntro()
    adjustAxesHeight axesContainerEl
    window.addEventListener 'resize', -> adjustAxesHeight axesContainerEl

init = ->
  mainContainerEl = document.getElementById 'js-main-container'
  axesContainerEl = document.getElementById 'js-axes-container'

  mainContainerEl.style.display = 'block'
  axesContainerEl.style.display = 'block'

  initModern(axesContainerEl)

init()
