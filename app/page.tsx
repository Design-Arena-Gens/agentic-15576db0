'use client'

import { useState, useRef, useEffect } from 'react'
import styles from './page.module.css'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showApiKeyInput, setShowApiKeyInput] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          apiKey,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      setShowApiKeyInput(false)
    }
  }

  if (showApiKeyInput) {
    return (
      <div className={styles.container}>
        <div className={styles.apiKeyContainer}>
          <h1>ChatGPT Interface</h1>
          <p>Enter your OpenAI API key to get started</p>
          <form onSubmit={handleApiKeySubmit} className={styles.apiKeyForm}>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className={styles.apiKeyInput}
            />
            <button type="submit" className={styles.apiKeyButton}>
              Start Chatting
            </button>
          </form>
          <p className={styles.note}>
            Your API key is only stored in your browser and never saved on our servers.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>ChatGPT</h1>
        <button
          onClick={() => setShowApiKeyInput(true)}
          className={styles.changeKeyButton}
        >
          Change API Key
        </button>
      </div>
      <div className={styles.chatContainer}>
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.welcomeMessage}>
              <h2>How can I help you today?</h2>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <div className={styles.messageContent}>
                <strong>{message.role === 'user' ? 'You' : 'ChatGPT'}:</strong>
                <p>{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className={`${styles.message} ${styles.assistantMessage}`}>
              <div className={styles.messageContent}>
                <strong>ChatGPT:</strong>
                <p className={styles.loading}>Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSubmit} className={styles.inputForm}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message..."
            className={styles.input}
            disabled={loading}
          />
          <button type="submit" className={styles.sendButton} disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
