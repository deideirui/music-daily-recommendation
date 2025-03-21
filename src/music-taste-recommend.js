const path = require('path')
const http = require('http')
const { chromium } = require('@playwright/test')
;(async () => {
  const context = await chromium.launchPersistentContext(
    path.join(__dirname, '../chromium-user-data'),
    {
      headless: false,
    },
  )

  const page = await context.newPage()

  await page.goto('https://music.163.com/#/discover/recommend/taste')

  // uncomment this for login.
  // await new Promise((resolve) => setTimeout(resolve, 60 * 1000))

  const collected = await page.evaluate(() => {
    const collect = () => {
      const el = document.contentFrame.document

      // selector tbody: recommends & starts
      return Array.from(el.querySelector('tbody').querySelectorAll('tr')).map(
        (x) => {
          const [x1, x2, x3, x4] = Array.from(x.querySelectorAll('td')).slice(1)

          const i1 = x1.querySelector('a')
          const i2 = i1.querySelector('b').title
          const i3 = i1.href

          const j1 = x2.querySelector('.u-dur').textContent

          const k1 = x3.querySelector('div')
          const k2 = Array.from(k1.querySelectorAll('a'))

          // case: no link
          /*
          <td class="">
            <div class="text" title="sin 98º">
              <span title="sin 98º">
                <span class="">
                  sin&nbsp;<div class="soil">Vp9</div>98º
                </span>
              </span>
            </div>
          </td>
          */
          const k3 = k2.length
            ? k2.map((x) => [
                Array.from(x.childNodes)
                  .map((x) => (x.nodeType === 3 ? x.nodeValue : ''))
                  .join(''),
                x.href,
              ])
            : [[k1.textContent, '']]

          const m1 = x4.querySelector('.text')
          const m2 = m1.querySelector('a')
          const m3 = m2.title
          const m4 = m2.href

          return {
            name: i2,
            link: i3,
            duration: j1,
            artists: k3.map((x) => ({ name: x[0], link: x[1] })),
            album: { name: m3, link: m4 },
          }
        },
      )
    }

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

    return delay(2000).then(collect)
  })

  const debug = false

  const req = http.request(
    'http://localhost:1234',
    {
      method: 'post',
      headers: {
        Origin: 'https://music.163.com',
      },
    },
    (res) => {
      res.on('data', (chunk) => debug && console.log('[data]', String(chunk)))
      res.on('end', () => {
        context.close()
      })
    },
  )

  req.write(JSON.stringify(collected))
  req.end()
})()
