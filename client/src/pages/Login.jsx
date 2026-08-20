import {useState} from 'react'
import {http} from '../api/http'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({email: '', password: ''})
  const [err, setErr] = useState('')
  const {login} = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await http.post('/auth/login', form)
      await login(res.data.token)
      navigate('/profile')
    } catch (e) {
      setErr(e?.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div style={{padding: 20}}>
      <h2>Login</h2>
      <form onSubmit={submit} style={{display: 'grid', gap: 10, maxWidth: 320}}>
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
        <button type='submit'>Login</button>
      </form>
      {err && <p style={{color: 'red'}}>{err}</p>}
      <p onClick={() => nav('/register')} style={{cursor: 'pointer'}}>
        Create account
      </p>
    </div>
  )
}
