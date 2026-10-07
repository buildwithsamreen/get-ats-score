import {useId} from 'react'
import {Form} from 'react-bootstrap'

// Target-role select, grouped by category. Hidden until roles have loaded.
export default function RolePicker({roles, value, onChange, label = 'Target role', help, size = 'sm'}) {
  const id = useId()
  if (!roles.length) return null
  const categories = [...new Set(roles.map((r) => r.category))]
  return (
    <Form.Group controlId={id}>
      <Form.Label className='small text-secondary mb-1'>{label}</Form.Label>
      <Form.Select size={size} value={value || ''} onChange={(e) => onChange(e.target.value)}>
        <option value=''>Any role (general check)</option>
        {categories.map((c) => (
          <optgroup key={c} label={c}>
            {roles
              .filter((r) => r.category === c)
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
          </optgroup>
        ))}
      </Form.Select>
      {help && <Form.Text className='text-secondary'>{help}</Form.Text>}
    </Form.Group>
  )
}
