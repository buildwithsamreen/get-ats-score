import {useState} from 'react'
import {http} from '../api/http'
import {useNavigate} from 'react-router-dom'

export default function Register() {
  const nav = useNavigate()
  const [form, setForm] = useState({name: '', email: '', password: ''})
  const [err, setErr] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await http.post('/auth/register', form)
      localStorage.setItem('token', res.data.token)
      nav('/')
    } catch (e) {
      setErr(e?.response?.data?.message || 'Register failed')
    }
  }

  return (
    <div style={{padding: 20}}>
      <h2>Register</h2>
      <form onSubmit={submit} style={{display: 'grid', gap: 10, maxWidth: 320}}>
        <input
          placeholder='Name'
          value={form.name}
          onChange={(e) => setForm({...form, name: e.target.value})}
        />
        <input
          placeholder='Email'
          value={form.email}
          onChange={(e) => setForm({...form, email: e.target.value})}
        />
        <input
          type='password'
          placeholder='Password'
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
        />
        <button type='submit'>Create Account</button>
      </form>
      {err && <p style={{color: 'red'}}>{err}</p>}
      <p onClick={() => nav('/login')} style={{cursor: 'pointer'}}>
        Go to Login
      </p>
    </div>
  )
}
