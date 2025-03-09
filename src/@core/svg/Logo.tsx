// React Imports
import type { SVGAttributes } from 'react'

import Image from 'next/image'

const Logo = (props: SVGAttributes<SVGElement>) => {
  return (
    <Image
      src='/images/logos/logo 1 datar untuk background putih.png'
      alt='Airatix Logo'
      width={180}
      height={40}
      priority
      style={{ objectFit: 'contain' }}
    />
  )
}

export default Logo
