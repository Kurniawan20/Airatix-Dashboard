'use client'

// React Imports
import React from 'react'

// MUI Imports
import Avatar from '@mui/material/Avatar'
import { styled } from '@mui/material/styles'

// Type Imports
import type { AvatarProps } from '@mui/material/Avatar'

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
 * @returns JSX.Element
 */
export const getAvatar = (props: GetAvatarProps): JSX.Element => {
  const { avatar, firstName, lastName, color = 'primary' } = props

  // If avatar is provided, return an avatar with the image
  if (avatar) {
    return <StyledAvatar src={avatar} alt={`${firstName} ${lastName}`} />
  }

  // If firstName and lastName are provided, return an avatar with the initials
  if (firstName && lastName) {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    return <StyledAvatar color={color}>{initials}</StyledAvatar>
  }

  // If only firstName is provided, return an avatar with the first letter
  if (firstName) {
    return <StyledAvatar color={color}>{firstName.charAt(0).toUpperCase()}</StyledAvatar>
  }

  // If only lastName is provided, return an avatar with the first letter
  if (lastName) {
    return <StyledAvatar color={color}>{lastName.charAt(0).toUpperCase()}</StyledAvatar>
  }

  // If nothing is provided, return a default avatar
  return <StyledAvatar color={color}>U</StyledAvatar>
}

export default getAvatar
