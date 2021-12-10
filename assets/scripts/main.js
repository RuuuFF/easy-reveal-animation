const RevealAnimations = [
  {
    selector: '.front-page',
    options: { size: 4 },
    styles: [
      {
        trigger: ['.front-page', 0, 40],
        style: [
          { 'clip-path': ['circle', 5, 75] },
        ],
      },
      {
        trigger: ['.music-note', 0, 40],
        style: [
          { opacity: [1, 0] },
          { transform: ['scale', 1, 0] },
        ]
      },
      {
        trigger: ['.title', 50, 70],
        style: [
          { opacity: [0, 1] },
          { transform: ['translate', -5, -5, 0, 0, 'rem'] },
        ]
      },
      {
        trigger: ['.sub-title', 70, 90],
        style: [
          { opacity: [0, 1] },
          { transform: ['translate', -5, 5, 0, 0, 'rem'] },
        ]
      },
    ]
  },

  {
    selector: '.second-page',
    options: { size: 5 },
    styles: [
      {
        trigger: ['.second-page', , 30],
        style: [
          { 'clip-path': ['circle', 5, 75] },
        ],
      },
      {
        trigger: ['.second-page', 50, 70],
        style: [
          { 'clip-path': ['circle', 75, 5] },
        ],
      },
      {
        trigger: ['.second-page', 90, 100],
        style: [
          { 'clip-path': ['circle', 5, 75] },
        ],
      },
    ]
  },
]

const RevealAnimation = {
  selectors: [],

  scale(num, in_min, in_max, out_min, out_max) {
    let percentage, value;

    if (out_max <= out_min) {
      percentage = -((num - in_min) / (in_max - in_min) - 1)
      value = percentage * (out_min - out_max) + out_max

      value > out_min ? value = out_min : ''
      value < out_max ? value = out_max : ''
    } else {
      percentage = (num - in_min) / (in_max - in_min)
      value = percentage * (out_max - out_min) + out_min

      value < out_min ? value = out_min : ''
      value > out_max ? value = out_max : ''
    }

    return value
  },

  transform(el, property, values, callScale) {
    const types = ['rotate', 'scale', 'scaleX', 'scaleY', 'translateX', 'translateY']
    const [type] = values

    if (type === 'translate') {
      const [, xStart, yStart, xEnd, yEnd, measure] = values
      const x = callScale(xStart, xEnd)
      const y = callScale(yStart, yEnd)

      el.style[property] = `${type}(${x + measure}, ${y + measure})`
    } else if (types.includes(type)) {
      const [, start, end, measure = ''] = values
      const value = callScale(start, end)

      el.style[property] = `${type}(${value + measure})`
    }
  },

  clipPath(el, property, values, callScale) {
    const [type] = values

    if (type === 'circle') {
      const [, start, end, measure = '%'] = values
      const value = callScale(start, end)
      el.style[property] = `${type}(${value + measure})`
    }
  },

  style(el, style, callScale) {
    for (let declaration of style) {
      const [property, values] = Object.entries(declaration)[0]

      if (property === 'clipPath' || property === 'clip-path') {
        this.clipPath(el, property, values, callScale)
      } else if (property === 'transform') {
        this.transform(el, property, values, callScale)
      } else {
        const [start, end, measure = ''] = values
        const value = callScale(start, end)
        el.style[property] = `${value + measure}`
      }
    }
  },

  newFinal(styles, index, selector, final) {
    for (let [outherIndex, { trigger }] of styles.entries()) {
      const sameSelector = trigger[0].includes(selector)

      if (sameSelector && outherIndex > index) {
        const [, outherBegin = 0] = trigger
        return (outherBegin - final) + final
      }
    }
  },

  checkSelectors(selector, array) {
    if (array.includes(selector)) {
      return false
    } else {
      array.push(selector)
      return true
    }
  },

  toggleStyles(styles, scrollRange) {
    const multipleSelectors = []

    for (let [index, { trigger, style }] of styles.entries()) {
      const [selector, begin = 0, final = 100] = trigger

      const el = document.querySelector(selector)
      const unique = this.checkSelectors(selector, multipleSelectors)
      const firstLoad = this.checkSelectors(selector, this.selectors)

      const newFinal = this.newFinal(styles, index, selector, final) || final
      const insideRange = scrollRange >= begin && scrollRange <= newFinal

      const callScale = (start, end) => this.scale(scrollRange, begin, final, Number(start), Number(end))

      if (((insideRange) || unique) || firstLoad) {
        this.style(el, style, callScale)
      }
    }
  },

  fixedElement(el, pin, styles) {
    const { top: pinTop, bottom: pinBottom, height: pinHeight } = pin.getBoundingClientRect()
    const { height: elHeight } = el.getBoundingClientRect()
    const num = -pinTop
    const in_max = pinHeight - elHeight

    const scrollRange = Math.round(this.scale(num, 0, in_max, 0, 100))

    if (pinTop <= 0 && pinBottom > elHeight) {
      el.style.position = 'fixed'
      el.style.inset = '0px'
    } else if (pinBottom <= elHeight) {
      el.style.position = 'absolute'
      el.style.inset = 'auto 0px 0px'
    } else {
      el.style.position = 'absolute'
      el.style.inset = '0px 0px auto'
    }

    this.toggleStyles(styles, scrollRange)
  },

  applyPinElStyles(el, pinEl, options) {
    const { height } = el.getBoundingClientRect()

    pinEl.style.position = 'relative'
    pinEl.style.height = `${height * options.size}px`

    el.style.position = 'absolute'
    el.style.inset = '0px 0px auto'
  },

  appendPinEl(el, pinEl, options) {
    const {
      parentNode: parent,
      nextElementSibling: nextElSibling,
      previousElementSibling: prevElSibling,
    } = el

    pinEl.appendChild(el)

    if (nextElSibling) {
      parent.insertBefore(pinEl, nextElSibling)
    } else if (prevElSibling) {
      parent.insertBefore(pinEl, prevElSibling.nextSibling);
    } else {
      parent.appendChild(pinEl)
    }

    this.applyPinElStyles(el, pinEl, options)
  },

  createPinElement(el, options, styles) {
    const pinEl = document.createElement('div')
    pinEl.className = 'pinned'

    this.appendPinEl(el, pinEl, options)
    this.fixedElement(el, pinEl, styles)
    window.addEventListener('scroll', () => this.fixedElement(el, pinEl, styles))
  },

  addTransitions(options, styles) {
    const { duration = 0.1, timing = 'linear', delay = 0 } = options

    for (let { trigger, style } of styles) {
      const [selector] = trigger
      const el = document.querySelector(selector)

      let transition = ''

      for (let [index, declaration] of style.entries()) {
        const property = Object.keys(declaration)[0]

        if (index === style.length - 1) {
          transition += `${property} ${duration}s ${timing} ${delay}s`
        } else {
          transition += `${property} ${duration}s ${timing} ${delay}s, `
        }
      }

      el.style.transition = transition
    }
  },

  getElementsInAnimation() {
    for (let { selector, options, styles } of RevealAnimations) {
      const { animate = false } = options
      const elements = document.querySelectorAll(selector)

      animate ? this.addTransitions(options, styles) : ''
      elements.forEach(el => this.createPinElement(el, options, styles))
    }
  },

  start() {
    this.getElementsInAnimation()
  }
}

RevealAnimation.start()