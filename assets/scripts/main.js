const ScrollAnimations = [
  {
    selector: '.front-page',
    options: {
      size: 3,
    },
    styles: [
      {
        trigger: ['.front-page', , 40],
        style: [
          { clipPath: 5, end: 75, type: 'circle(', measure: '%)' },
        ],
      },
      {
        trigger: ['.music-note', , 40],
        style: [
          { opacity: 1, end: 0 },
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

  toggleStyles(styles, scrollPercent) {
    for (let { trigger, style } of styles) {
      const [selector, begin = 0, final = 100] = trigger
      const el = document.querySelector(selector)

      for (let props of style) {
        const { type = '', end, measure = '' } = props
        const key = Object.keys(props)[0]
        const start = props[Object.keys(props)[0]]

        const value = this.scale(scrollPercent, begin, final, start, end)

        if (begin < scrollPercent && final >= scrollPercent) {
          el.style[key] = `${type + value + measure}`

        } else if (scrollPercent <= begin) {
          el.style[key] = `${type + start + measure}`

        } else if (scrollPercent > final) {
          el.style[key] = `${type + end + measure}`

        }
      }
    }
  },

  fixedElement(el, pin, styles) {
    const { height: elHeight } = el.getBoundingClientRect()
    const {
      top: pinTop,
      bottom: pinBottom,
      height: pinHeight
    } = pin.getBoundingClientRect()

    const num = -pinTop
    const in_max = pinHeight - elHeight

    const scrollPercent = Math.round(this.scale(num, 0, in_max, 0, 100))

    if (pinTop <= 0 && pinBottom > elHeight) {
      el.style.position = 'fixed'
    } else if (pinBottom <= elHeight) {
      el.style.position = 'absolute'
      el.style.top = 'auto'
      el.style.bottom = 0
    } else {
      el.style.position = 'absolute'
      el.style.top = 0
    }

    this.toggleStyles(styles, scrollPercent)
  },

  applyPinElStyles(el, pinEl, options) {
    const { height } = el.getBoundingClientRect()

    pinEl.style.position = 'relative'
    pinEl.style.height = `${height * options.size}px`

    el.style.position = 'absolute'
    el.style.top = 0
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