// React Imports
import React from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'

// Type Imports
import type { AvatarProps } from '@mui/material/Avatar'
import type { ReactNode } from 'react'

// Styled Components
const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 38,
  height: 38,
  fontSize: '1rem',
  fontWeight: 500
}))

interface GetAvatarProps {
  avatar?: string
  firstName?: string
  lastName?: string
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info'
}

/**
 * Returns an avatar component based on the provided props
 * If avatar is provided, it will be used as the src
 * If not, the first letters of firstName and lastName will be used
 * @param props GetAvatarProps
 * @returns ReactNode
 */
export const getAvatar = (props: GetAvatarProps): ReactNode => {
  const { avatar, firstName, lastName, color = 'primary' } = props

  // If avatar is provided, return an avatar with the image
  if (avatar) {
    return React.createElement(StyledAvatar, { src: avatar, alt: `${firstName} ${lastName}` });
  }

  // If firstName and lastName are provided, return an avatar with the initials
  if (firstName && lastName) {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    return React.createElement(StyledAvatar, { color }, initials);
  }

  // If only firstName is provided, return an avatar with the first letter
  if (firstName) {
    return React.createElement(StyledAvatar, { color }, firstName.charAt(0).toUpperCase());
  }

  // If only lastName is provided, return an avatar with the first letter
  if (lastName) {
    return React.createElement(StyledAvatar, { color }, lastName.charAt(0).toUpperCase());
  }

  // If nothing is provided, return a default avatar
  return React.createElement(StyledAvatar, { color }, 'U');
}

export default getAvatar
