import { MessageCircle } from 'lucide-react'
import './ConversationEntry.css'
import { useState } from 'react'
import type { Recording } from './Recording'

export default function ConversationEntry({ recording, className }: { recording: Recording; className?: string }) {
  let [isTranscribing, setIsTranscribing] = useState(false)
  let [transcription, setTranscription] = useState(recording.transcription)

  return (
    <div className={className}>
      <div></div>
        <label>
          { recording.mimeType}
        </label>
      <div className="controls">
        <audio src={URL.createObjectURL(recording.blob)} controls />
        <button onClick={async () => {
              setIsTranscribing(true) 
              try {
                let response = await fetch('/api/transcribe', {
                  method: 'POST',
                  body: recording.blob,
                  headers: {
                    'Content-Type': recording.mimeType
                  }
                })
                let newTranscription = await response.json()
                recording.transcription = newTranscription
                setTranscription(newTranscription)
                console.log(transcription)
              } catch (error) {
                console.error(error)
              }
              setIsTranscribing(false)
            }}
            disabled={isTranscribing}
          >
            <MessageCircle />
          </button>
        </div>
        <div>
          { transcription }
        </div>
    </div>
  )
}