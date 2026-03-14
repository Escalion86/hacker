import React from 'react'
import Svg, { G, Path } from 'react-native-svg'

export default function NetworkIcon({ size = 20, color = '#fff' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 98 98" fill="none">
      <G
        transform="translate(0,98) scale(0.1,-0.1)"
        fill={color}
        stroke="none"
      >
        <Path d="M394 743 c-34 -32 -123 -139 -126 -153 -2 -9 8 -14 29 -16 27 -1 38 5 60 33 l28 35 5 -209 5 -208 30 0 30 0 3 252 c2 219 0 253 -14 267 -20 20 -27 20 -50 -1z" />
        <Path d="M527 754 c-4 -4 -7 -119 -7 -255 0 -212 2 -250 16 -263 8 -9 19 -16 23 -16 12 0 42 30 106 105 l58 70 -38 3 c-31 3 -42 -1 -60 -22 -12 -14 -25 -26 -28 -26 -4 0 -8 91 -9 203 l-3 202 -25 3 c-14 2 -29 0 -33 -4z" />
      </G>
    </Svg>
  )
}
