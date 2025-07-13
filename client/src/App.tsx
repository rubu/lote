import { useEffect, useState } from 'react'
import './App.css'
import { Mic } from 'lucide-react'
import ConversationEntry from './ConversationEntry'

class VoiceRecorder {
  private mediaRecorder: MediaRecorder
  private chunks: BlobPart[] = []
  private recordingPromise: Promise<Blob>

  constructor(mediaRecorder: MediaRecorder) {
    console.log(`created voice recorder with audio type ${mediaRecorder.mimeType}`)
    this.mediaRecorder = mediaRecorder
    this.mediaRecorder.addEventListener('dataavailable', (event) => {
      console.log(`got audio data (${event.data.size} bytes)`)
      this.chunks.push(event.data)
    })
    this.recordingPromise = new Promise((resolve) => {
      this.mediaRecorder.addEventListener('stop', () => {
        let blob = new Blob(this.chunks, { type: 'audio/wav' })
        this.chunks = []
        resolve(blob)
      })
    })
    this.mediaRecorder.start()
  }

  stop(): Promise<Blob> {
    this.mediaRecorder.stop()
    return this.recordingPromise
  }

  static async create() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    return new VoiceRecorder(mediaRecorder)
  }
}

function formatDuration(duration: number) {
  let minutes = Math.floor(duration / 60)
  let seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

type State = 'IDLE' | 'RECORDING' | 'PLAYING'

function App() {
  let [recordings, setRecordings] = useState<Blob[]>([])
  let [recorder, setRecorder] = useState<VoiceRecorder | null>(null)
  let [duration, setDuration] = useState(0)
  let [state, setState] = useState<State>('IDLE')
  let [apiEndpoint, setApiEndpoint] = useState(`${window.location.origin}/api/v1/transcribe`)

  useEffect(() => {
    if (!recorder) {
      return
    }
  
    let interval = setInterval(() => {
      setDuration((prevDuration) => prevDuration + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [recorder])

  return (
    <>
      <div id="recording-container">
        <input id="api-endpoint" type="text" name="apiEndpoint" value={apiEndpoint} onChange={(e) => {
          setApiEndpoint(e.target.value)
        }} />
        <div id="recording-controls">
          <button className={`${recorder ? 'active' : ''}`} disabled={state !== 'IDLE' && state !== 'RECORDING'} onClick={async () => {
              if (!recorder) {
                setDuration(0)
                let recorder = await VoiceRecorder.create()
                setRecorder(recorder)
                setState('RECORDING');
              } else {
                let recording = await recorder.stop()
                setRecordings([...recordings, recording])
                setRecorder(null)
                setState('IDLE');
              }
            }}
          >
            <Mic/>
          </button>
        </div>
        <label id="recording-duration">
          { formatDuration(duration) }
        </label>
      </div>
      <div id="conversation-container">
        {recordings.map((recording, index) => (
          <ConversationEntry key={index} recording={recording} />
        ))}
      </div>
    </>
  )
}

export default App
