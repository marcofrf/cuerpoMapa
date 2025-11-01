'use client'
import dynamic from 'next/dynamic'

const Sketch = dynamic(() => import('./MySketch'), { ssr: false })
export default Sketch
