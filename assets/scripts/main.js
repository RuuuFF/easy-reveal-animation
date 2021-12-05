const ScrollAnimations = [
  {
    selector: '.front-page',
    options: {
      size: 3,
    },
    styles: [
      {
        trigger: ['.front-page', 0, 40],
        style: [
          { clipPath: ['circle', 5], end: 75, measure: '%' },
        ],
      },
      {
        trigger: ['.music-note', 0, 40],
        style: [
          { opacity: 1, end: 0 },
          { transform: 1, end: 0, type: 'scale(', measure: ')' },
        ]
      },
      {
        trigger: ['.title', 50, 70],
        style: [
          { opacity: 0, end: 1 },
        ]
      },
      {
        trigger: ['.sub-title', 70, 90],
        style: [
          { opacity: 0, end: 1 },
        ]
      },
    ]
  },

  {
    selector: '.second-page',
    options: {
      size: 3,
    },
    styles: [
      {
        trigger: ['.second-page', , 33],
        style: [
          { clipPath: ['circle', 5], end: 75, measure: '%' },
        ],
      },
      {
        trigger: ['.second-page', 33, 66],
        style: [
          { clipPath: ['circle', 75], end: 5, measure: '%' },
        ],
      },
      {
        trigger: ['.second-page', 66,],
        style: [
          { clipPath: ['circle', 5], end: 75, measure: '%' },
        ],
      },
    ]
  },
]

const RevealAnimation = {
  scale(num, in_min, in_max, out_min, out_max) {
    let percentage, value;

    if (out_max < out_min) {
      percentage = -((num - in_min) / (in_max - in_min) - 1)
      value = percentage * (out_min - out_max) + out_max
    } else {
      percentage = (num - in_min) / (in_max - in_min)
      value = percentage * (out_max - out_min) + out_min

      value = value < out_min ? out_min : value
      value = value > out_max ? out_max : value
    }

    return value
  },

  checkSelectors(selectors, selector) {
    if (selectors.includes(selector)) {
      return false
    } else {
      selectors.push(selector)
      return true
    }
  },

  toggleStyles(styles, scrollRange) {
    const selectors = []

    for (let { trigger, style } of styles) {
      const [selector, begin = 0, final = 100] = trigger
      const contains = this.checkSelectors(selectors, selector)

      if ((scrollRange >= begin && scrollRange <= final) || contains) {
        const el = document.querySelector(selector)

        for (let declaration of style) {
          const property = Object.keys(declaration)[0]
          const { end, measure = '' } = declaration

          if (property === 'clipPath') {
            const [type, startValue] = declaration[Object.keys(declaration)[0]]

            const value = this.scale(scrollRange, begin, final, Number(startValue), end)
            el.style[property] = `${type}(${value}${measure})`
          } else {
            const startValue = declaration[Object.keys(declaration)[0]]

            const value = this.scale(scrollRange, begin, final, startValue, end)
            el.style[property] = `${value + measure}`
          }
        }
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
      el.style.top = 0
      el.style.bottom = 0
      this.toggleStyles(styles, scrollRange)
    } else if (pinBottom <= elHeight) {
      el.style.position = 'absolute'
      el.style.top = 'auto'
      el.style.bottom = 0
    } else {
      el.style.position = 'absolute'
      el.style.top = 0
      el.style.bottom = 'auto'
    }
  },

  applyPinElStyles(el, pinEl, options) {
    const { height } = el.getBoundingClientRect()

    pinEl.style.position = 'relative'
    pinEl.style.height = `${height * options.size}px`

    el.style.position = 'absolute'
    el.style.left = 0
    el.style.right = 0
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

  getElementsInAnimation() {
    for (let { selector, options, styles } of ScrollAnimations) {
      const elements = document.querySelectorAll(selector)

      elements.forEach(el => this.createPinElement(el, options, styles))
    }
  },

  start() {
    this.getElementsInAnimation()
  }
}

RevealAnimation.start()