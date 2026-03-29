import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export default function ChatWidget({ user, propertyId, propertyTitle, ownerId }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  const isOwner = user?.id === ownerId

  // Get or create conversation
  const getOrCreateConversation = useCallback(async () => {
    if (!user || !propertyId || !ownerId) return null
    if (user.id === ownerId) return null

    // Try to find existing conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('property_id', propertyId)
      .eq('tenant_id', user.id)
      .eq('owner_id', ownerId)
      .maybeSingle()

    if (existing) return existing.id

    // Create new conversation
    const { data: created, error } = await supabase
      .from('conversations')
      .insert({
        property_id: propertyId,
        tenant_id: user.id,
        owner_id: ownerId,
        property_title: propertyTitle,
      })
      .select('id')
      .single()

    if (error) return null
    return created.id
  }, [user, propertyId, ownerId, propertyTitle])

  // Load messages
  const loadMessages = useCallback(async (convId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(100)
    setMessages(data || [])
  }, [])

  // Open chat
  const handleOpen = async () => {
    setOpen(true)
    setLoading(true)
    const convId = await getOrCreateConversation()
    if (convId) {
      setConversationId(convId)
      await loadMessages(convId)

      // Subscribe to realtime
      channelRef.current = supabase
        .channel(`chat-${convId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${convId}`,
        }, (payload) => {
          setMessages(prev => [...prev, payload.new])
        })
        .subscribe()
    }
    setLoading(false)
  }

  // Cleanup subscription
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send message
  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !conversationId) return

    const msgText = newMsg.trim()
    setNewMsg('')

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
      content: msgText,
    })

    // Update conversation last_message
    await supabase.from('conversations').update({
      last_message: msgText,
      last_message_at: new Date().toISOString(),
    }).eq('id', conversationId)
  }

  if (!user || isOwner) return null

  return (
    <>
      {/* Chat button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-600/20"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Chat con el propietario
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="text-sm font-semibold">Chat - {propertyTitle?.slice(0, 25)}{propertyTitle?.length > 25 ? '...' : ''}</span>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded transition-colors" aria-label="Cerrar chat">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages */}
          <div className="h-64 overflow-y-auto p-3 space-y-2 bg-gray-50 dark:bg-gray-900">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-xs text-gray-400">Envía un mensaje al propietario sobre esta propiedad.</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isMine = msg.sender_id === user.id
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-sm'}`}>
                      {!isMine && <p className="text-[10px] font-semibold text-gray-400 mb-0.5">{msg.sender_name}</p>}
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-gray-700">
            <input
              type="text"
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-gray-700 dark:text-gray-200 placeholder-gray-400"
              aria-label="Mensaje"
            />
            <button
              type="submit"
              disabled={!newMsg.trim()}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Enviar mensaje"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
