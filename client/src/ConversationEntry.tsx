import { MessageCircle } from 'lucide-react'
import './ConversationEntry.css'
import { useState } from 'react'

export default function ConversationEntry({ recording }: { recording: Blob }) {
  let [isTranscribing, setIsTranscribing] = useState(false)

  return (
    <div>
      <div className="conversation-entry-controls">
        <audio src={URL.createObjectURL(recording)} controls />
        <button onClick={async () => {
            setIsTranscribing(true) 
            try {
              let response = await fetch('/api/transcribe', {
                method: 'POST',
                body: recording,
              })
              let transcription = await response.json()
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
    </div>
  )
}