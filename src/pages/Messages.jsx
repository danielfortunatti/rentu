import { useState, useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Messages({ user }) {
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const channelRef = useRef(null)

  // Load conversations
  useEffect(() => {
    if (!user) return
    async function load() {
      const { data } = await supabase
        .from('conversations')
        .select('*')
        .or(`tenant_id.eq.${user.id},owner_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })
      setConversations(data || [])
      setLoading(false)
    }
    load()
  }, [user])

  // Load messages for active conversation
  const loadMessages = useCallback(async (convId) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(200)
    setMessages(data || [])
  }, [])

  // Select conversation
  const selectConversation = async (conv) => {
    setActiveConv(conv)
    await loadMessages(conv.id)

    // Cleanup old subscription
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
    }

    // Subscribe to realtime
    channelRef.current = supabase
      .channel(`messages-${conv.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conv.id}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()
  }

  // Cleanup
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
    if (!newMsg.trim() || !activeConv) return

    const msgText = newMsg.trim()
    setNewMsg('')

    await supabase.from('messages').insert({
      conversation_id: activeConv.id,
      sender_id: user.id,
      sender_name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
      content: msgText,
    })

    await supabase.from('conversations').update({
      last_message: msgText,
      last_message_at: new Date().toISOString(),
    }).eq('id', activeConv.id)

    // Update local state
    setConversations(prev => prev.map(c =>
      c.id === activeConv.id ? { ...c, last_message: msgText, last_message_at: new Date().toISOString() } : c
    ))
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl text-gray-800 dark:text-gray-100 mb-4">Inicia sesión para ver tus mensajes</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Mensajes | Rentu</title>
        <meta name="description" content="Tus conversaciones sobre propiedades en arriendo en Rentu." />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mb-6">Mensajes</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[60vh]">
          {/* Conversation list */}
          <div className="md:col-span-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Conversaciones</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-400">No tienes conversaciones aún</p>
                  <p className="text-xs text-gray-400 mt-1">Contacta a un propietario para empezar</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const isActive = activeConv?.id === conv.id
                  const otherName = conv.tenant_id === user.id ? 'Propietario' : 'Arrendatario'
                  return (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isActive ? 'bg-brand-50 dark:bg-brand-900/20 border-l-2 border-brand-500' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                          <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{otherName}</p>
                          <p className="text-xs text-gray-400 truncate">{conv.property_title || 'Propiedad'}</p>
                          {conv.last_message && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{conv.last_message}</p>
                          )}
                        </div>
                        {conv.last_message_at && (
                          <span className="text-[10px] text-gray-400 flex-shrink-0">
                            {formatTimeAgo(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Message area */}
          <div className="md:col-span-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden flex flex-col">
            {!activeConv ? (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-200 dark:text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="text-sm text-gray-400">Selecciona una conversación para ver los mensajes</p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {activeConv.tenant_id === user.id ? 'Propietario' : 'Arrendatario'}
                    </p>
                    <Link
                      to={`/propiedad/${activeConv.property_id}`}
                      className="text-xs text-brand-600 hover:text-brand-700"
                    >
                      {activeConv.property_title || 'Ver propiedad'}
                    </Link>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900 min-h-[40vh] max-h-[50vh]">
                  {messages.map((msg) => {
                    const isMine = msg.sender_id === user.id
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-sm shadow-sm'}`}>
                          {!isMine && <p className="text-[10px] font-semibold text-gray-400 mb-0.5">{msg.sender_name}</p>}
                          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="flex items-center gap-3 p-4 border-t border-gray-100 dark:border-gray-700">
                  <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                    aria-label="Escribir mensaje"
                  />
                  <button
                    type="submit"
                    disabled={!newMsg.trim()}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                    aria-label="Enviar"
                  >
                    Enviar
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
}
