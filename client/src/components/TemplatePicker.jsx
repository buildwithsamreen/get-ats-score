import {Modal, Row, Col} from 'react-bootstrap'
import {CircleCheck} from 'lucide-react'
import {TEMPLATES, PAGE} from '../content/templates'
import ResumePreview from './ResumePreview'
import ScaledPage from './ScaledPage'

// Gallery of templates, each showing the user's own resume.
export default function TemplatePicker({show, onHide, resume, value, onChange}) {
  return (
    <Modal show={show} onHide={onHide} size='xl' centered scrollable fullscreen='sm-down'>
      <Modal.Header closeButton>
        <Modal.Title className='h5'>Choose a template</Modal.Title>
      </Modal.Header>
      <Modal.Body className='bg-body-tertiary'>
        <p className='small text-secondary'>
          Every template is single-column with standard headings, so they all read well in applicant tracking systems.
        </p>
        <Row className='g-3'>
          {Object.entries(TEMPLATES).map(([id, t]) => {
            const selected = id === value
            return (
              <Col key={id} xs={12} sm={6} lg={4}>
                <button
                  type='button'
                  onClick={() => {
                    onChange(id)
                    onHide()
                  }}
                  className={`w-100 text-start bg-surface card-hover rounded-3 p-2 border ${selected ? 'border-primary border-2' : ''}`}
                  aria-pressed={selected}
                >
                  <div aria-hidden='true' style={{pointerEvents: 'none'}}>
                    <ScaledPage naturalWidth={(PAGE.width * 4) / 3} aspectRatio='4 / 5' className='rounded-2 border'>
                      <ResumePreview resume={resume} templateId={id} />
                    </ScaledPage>
                  </div>
                  <div className='pt-2 px-1'>
                    <div className='fw-semibold d-flex justify-content-between'>
                      {t.label}
                      {selected && (
                        <span className='text-primary small d-inline-flex align-items-center gap-1'>
                          <CircleCheck size={14} aria-hidden='true' /> Selected
                        </span>
                      )}
                    </div>
                    <div className='small text-secondary'>{t.description}</div>
                  </div>
                </button>
              </Col>
            )
          })}
        </Row>
      </Modal.Body>
    </Modal>
  )
}
