import {ToggleButton, ToggleButtonGroup} from 'react-bootstrap'
import {Eye, PencilLine} from 'lucide-react'

// Edit / Preview switch shown only below the lg breakpoint, where the editor's
// two columns stack. Pair with the `.mobile-hide` class in index.css.
export default function MobileViewSwitch({value, onChange, previewLabel = 'Preview'}) {
  return (
    <div className='d-lg-none mb-3 position-sticky bg-body rounded-2' style={{top: 8, zIndex: 5}}>
      <ToggleButtonGroup type='radio' name='mobile-view' value={value} onChange={onChange} className='w-100 shadow-sm'>
        <ToggleButton id='mobile-view-edit' value='edit' variant='outline-primary'>
          <PencilLine size={16} aria-hidden='true' /> Edit
        </ToggleButton>
        <ToggleButton id='mobile-view-preview' value='preview' variant='outline-primary'>
          <Eye size={16} aria-hidden='true' /> {previewLabel}
        </ToggleButton>
      </ToggleButtonGroup>
    </div>
  )
}
