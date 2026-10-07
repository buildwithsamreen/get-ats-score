import {useId} from 'react'
import {Form} from 'react-bootstrap'

export default function Field({label, ...props}) {
  const id = useId()
  return (
    <Form.Group controlId={id}>
      <Form.Label className='small text-secondary mb-1'>{label}</Form.Label>
      <Form.Control size='sm' {...props} />
    </Form.Group>
  )
}
