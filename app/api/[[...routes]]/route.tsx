/** @jsxImportSource frog/jsx */

import { Button, Frog, TextInput } from 'frog'
import { devtools } from 'frog/dev'
// import { neynar } from 'frog/hubs'
import { pinata } from 'frog/hubs'
import { handle } from 'frog/next'
import { serveStatic } from 'frog/serve-static'
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import axios from "axios"

const client = new NeynarAPIClient(process.env.NEYNAR_API_KEY!);

const app = new Frog({
  assetsPath: '/',
  basePath: '/api',
  headers: {
    'cache-control': 'max-age=0',
  },
  // hub: neynar({ apiKey: 'NEYNAR_FROG_FM' })
  hub: {
    apiUrl: "https://hubs.airstack.xyz",
    fetchOptions: {
      headers: {
        "x-airstack-hubs": process.env.AIRSTACK_API_KEY ? process.env.AIRSTACK_API_KEY : "",
      }
    }
  }
})

app.frame('/', (c) => {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 50,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        > Today in History 📖
        </div>
      </div>
    ),
    intents: [
        <Button>Check</Button>,
    ],
    action: '/result'
  })
})

app.frame('/result/:index?', async (c) => {
  const { verified, frameData } = c
  
  let { index } = c.req.param()

  if (!verified) {
    return ReturnUnverified(c, "Please login to Farcaster")
  }

  const senderFid = frameData?.fid

  if (!senderFid) {
    return ReturnUnverified(c, "Please login to farcaster")
  }

  let response = await axios.get('https://history.muffinlabs.com/date')
  let events = response.data.data.Events
  if (!events) {
    return ReturnUnverified(c, 'Nothing happened today')
  }

  if (!index) {
    index = "0"
  }

  let indexNum = parseInt(index)

  if (indexNum >= events.length) {
    indexNum = 0
  }

  let event = events[indexNum]

  let randomNum = randomIntFromInterval(0, events.length - 1)

  let intents = [
    <Button action={`/result/${indexNum + 1}`}>Next</Button>,
    <Button action={`/result/${randomNum}`}>Random</Button>,
  ]
  
  const eventYear = event.year
  const eventText = event.text

  if (event.links.length > 0) {
    intents.push(<Button.Redirect location={event.links[0].link}>{event.links[0].title}</Button.Redirect>)
  }

  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background:'linear-gradient(to right, #432889, #17101F)',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 20,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 5,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {`${eventYear}`}
        </div>
        <div
          style={{
            color: 'white',
            fontSize: 40,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 10,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        >
          {`${eventText}`}
        </div>
      </div>
    ),
    intents: intents,
  })
})

function randomIntFromInterval(min: number, max: number) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function ReturnUnverified(c: any, message: string) {
  return c.res({
    image: (
      <div
        style={{
          alignItems: 'center',
          background: 'black',
          backgroundSize: '100% 100%',
          display: 'flex',
          flexDirection: 'column',
          flexWrap: 'nowrap',
          height: '100%',
          justifyContent: 'center',
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            color: 'white',
            fontSize: 60,
            fontStyle: 'normal',
            letterSpacing: '-0.025em',
            lineHeight: 1.4,
            marginTop: 30,
            padding: '0 120px',
            whiteSpace: 'pre-wrap',
          }}
        > {`${message}`}
        </div>
      </div>
    ),
  })
}

devtools(app, { serveStatic })

export const GET = handle(app)
export const POST = handle(app)
