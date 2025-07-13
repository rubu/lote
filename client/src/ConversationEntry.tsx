import { MessageCircle } from 'lucide-react'
import './ConversationEntry.css'
import { useState } from 'react'
import type { Recording } from './Recording'

export default function ConversationEntry({ recording, apiEndpoint, className }: { recording: Recording; apiEndpoint: string; className?: string }) {
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
                let response = await fetch(apiEndpoint, {
                  method: 'POST',
                  body: recording.blob,
                  headers: {
                    'Content-Type': recording.mimeType
                  }
                })
                let newTranscription = (await response.json()).transcription
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