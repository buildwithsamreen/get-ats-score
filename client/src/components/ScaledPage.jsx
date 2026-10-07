import {useEffect, useRef, useState} from 'react'

/**
 * Renders children at a fixed natural width (CSS px) and scales them down to
 * fit the container. Without `aspectRatio` the container grows to the scaled
 * content height; with it the content is cropped (used for thumbnails).
 */
export default function ScaledPage({naturalWidth, aspectRatio, className = '', children}) {
  const outer = useRef(null)
  const inner = useRef(null)
  const [scale, setScale] = useState(0.5)
  const [innerHeight, setInnerHeight] = useState(0)

  useEffect(() => {
    const ro = new ResizeObserver(() => {
      if (outer.current) setScale(Math.min(1, outer.current.clientWidth / naturalWidth))
      if (inner.current) setInnerHeight(inner.current.offsetHeight)
    })
    if (outer.current) ro.observe(outer.current)
    if (inner.current) ro.observe(inner.current)
    return () => ro.disconnect()
  }, [naturalWidth])

  return (
    <div
      ref={outer}
      className={`overflow-hidden ${className}`}
      style={aspectRatio ? {aspectRatio} : {height: innerHeight * scale}}
    >
      <div ref={inner} style={{width: naturalWidth, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
        {children}
      </div>
    </div>
  )
}
