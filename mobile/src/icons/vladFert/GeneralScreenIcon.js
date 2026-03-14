import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

export default function GeneralScreenIcon({ size = 20, color = '#ff971d' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 98 98" fill="none">
      <Path
        d="M49 17C30.22 17 15 32.22 15 51c0 16.57 13.43 30 30 30h9c4.97 0 9-4.03 9-9 0-2.39-.93-4.69-2.59-6.38A9.02 9.02 0 0 1 58 59c0-4.97 4.03-9 9-9h6c5.52 0 10-4.48 10-10C83 27.3 67.33 17 49 17Z"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="32.5" cy="37" r="3.8" fill={color} />
      <Circle cx="41.5" cy="31.5" r="3.8" fill={color} />
      <Circle cx="52.5" cy="30.5" r="3.8" fill={color} />
      <Circle cx="61.5" cy="35" r="3.8" fill={color} />
    </Svg>
  )
}
