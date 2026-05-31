import { useState, useEffect, useCallback } from 'react'
import { StellarContractsKit } from 'stellar-contracts-kit'
import { CONTRACT_ID } from '../contracts/notes.js'
import { CONTRACT_ID as HELLO_CONTRACT_ID } from '../contracts/hello.js'
import './App.css'

// const CONTRACT_ID = 'CDERI5KIEWKO3MMZDPUFWYDDH4JTUXYSX2SBYMVYBSZUTT25W7TXVHCU' // Replace with your deployed contract ID
const kit = new StellarContractsKit({ network: 'testnet' })

export default function App() {
  const [address, setAddress] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [error, setError] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [txHash, setTxHash] = useState(null)
  const [helloInput, setHelloInput] = useState('')
  const [helloResult, setHelloResult] = useState(null)
  const [helloLoading, setHelloLoading] = useState(false)

  const clearError = () => setError(null)

  const fetchNotes = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const contract = await kit.contract(CONTRACT_ID)
      const { result } = await contract.get_notes.read()
      setNotes(result ?? [])
    } catch (err) {
      setError('Failed to fetch notes: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleConnect = async () => {
    setError(null)
    try {
      const { address: addr } = await kit.connect()
      setAddress(addr)
    } catch (err) {
      setError('Wallet connection failed: ' + err.message)
    }
  }

  const handleDisconnect = () => {
    setAddress(null)
    setNotes([])
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setCreating(true)
    setError(null)
    setTxHash(null)
    try {
      const contract = await kit.contract(CONTRACT_ID)
      const { txHash: hash } = await contract.create_note.invoke(title.trim(), content.trim())
      setTxHash(hash)
      setTitle('')
      setContent('')
      await fetchNotes()
    } catch (err) {
      setError('Failed to create note: ' + err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    setError(null)
    setTxHash(null)
    try {
      const contract = await kit.contract(CONTRACT_ID)
      const { txHash: hash } = await contract.delete_note.invoke(id)
      setTxHash(hash)
      await fetchNotes()
    } catch (err) {
      setError('Failed to delete note: ' + err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleHello = async (e) => {
    e.preventDefault()
    setHelloLoading(true)
    setError(null)
    setHelloResult(null)
    try {
      const contract = await kit.contract(HELLO_CONTRACT_ID)
      const { result } = await contract.hello.invoke(helloInput.trim())
      setHelloResult(result)
    } catch (err) {
      setError('Hello failed: ' + err.message)
    } finally {
      setHelloLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      fetchNotes()
    }
  }, [address, fetchNotes])

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="logo">&#9679;</span>
          <h1 className="brand">Web3 Notes</h1>
          <span className="network-badge">Testnet</span>
        </div>
        <div className="header-right">
          {address ? (
            <div className="wallet-info">
              <span className="address">
                {address.slice(0, 6)}…{address.slice(-4)}
              </span>
              <button className="btn btn-outline" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={handleConnect}>
              Connect Wallet
            </button>
          )}
        </div>
      </header>

      <main className="main">
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button className="alert-close" onClick={clearError}>✕</button>
          </div>
        )}

        {txHash && (
          <div className="alert alert-success">
            <span>Transaction submitted: <code>{txHash.slice(0, 16)}…</code></span>
            <button className="alert-close" onClick={() => setTxHash(null)}>✕</button>
          </div>
        )}

        {!address ? (
          <div className="empty-state">
            <div className="empty-icon">&#128274;</div>
            <h2>Connect your wallet</h2>
            <p>Connect a Stellar wallet to create and manage your on-chain notes.</p>
            <button className="btn btn-primary btn-lg" onClick={handleConnect}>
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="content">
            <section className="create-section">
              <h2 className="section-title">New Note</h2>
              <form className="create-form" onSubmit={handleCreate}>
                <input
                  className="input"
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={creating}
                  required
                />
                <textarea
                  className="textarea"
                  placeholder="Write your note here…"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={creating}
                  rows={4}
                  required
                />
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={creating || !title.trim() || !content.trim()}
                >
                  {creating ? <span className="spinner" /> : null}
                  {creating ? 'Publishing…' : 'Publish Note'}
                </button>
              </form>
            </section>

            <section className="hello-section">
              <h2 className="section-title">Hello World</h2>
              <form className="hello-form" onSubmit={handleHello}>
                <div className="hello-row">
                  <input
                    className="input"
                    type="text"
                    placeholder="Enter your name…"
                    value={helloInput}
                    onChange={(e) => setHelloInput(e.target.value)}
                    disabled={helloLoading}
                  />
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={helloLoading || !helloInput.trim()}
                  >
                    {helloLoading ? <span className="spinner" /> : null}
                    {helloLoading ? 'Calling…' : 'Say Hello'}
                  </button>
                </div>
              </form>
              {helloResult && (
                <div className="hello-result">
                  {helloResult.join(' ')}
                </div>
              )}
            </section>

            <section className="notes-section">
              <div className="section-header">
                <h2 className="section-title">Your Notes</h2>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={fetchNotes}
                  disabled={loading}
                >
                  {loading ? <span className="spinner spinner-sm" /> : '↻'} Refresh
                </button>
              </div>

              {loading && notes.length === 0 ? (
                <div className="loading-state">
                  <span className="spinner spinner-lg" />
                  <p>Loading notes…</p>
                </div>
              ) : notes.length === 0 ? (
                <div className="empty-notes">
                  <p>No notes yet. Create your first on-chain note above.</p>
                </div>
              ) : (
                <ul className="notes-list">
                  {notes.map((note) => (
                    <li key={String(note.id)} className="note-card">
                      <div className="note-body">
                        <h3 className="note-title">{note.title}</h3>
                        <p className="note-content">{note.content}</p>
                        <span className="note-id">ID #{String(note.id)}</span>
                      </div>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(note.id)}
                        disabled={deletingId === note.id}
                      >
                        {deletingId === note.id ? <span className="spinner spinner-sm" /> : '✕'}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
