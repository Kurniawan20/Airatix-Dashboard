/**
 * Utility to reset theme settings cookie 
 * Use this in a component to reset theme settings when needed
 */

import themeConfig from '@configs/themeConfig'
import primaryColorConfig from '@configs/primaryColorConfig'
import { parseCookies, setCookie } from 'nookies'

export const resetThemeSettings = (ctx?: any) => {
  // Get the settings cookie name from theme config
  const cookieName = themeConfig.settingsCookieName
  
  // Get the cookies
  const cookies = parseCookies(ctx)
  
  // Check if the settings cookie exists
  if (cookies[cookieName]) {
    // Parse the existing cookie
    const settings = JSON.parse(cookies[cookieName])
    
    // Update the primary color
    settings.primaryColor = primaryColorConfig[0].main
    
    // Set the cookie with the new settings
    setCookie(ctx, cookieName, JSON.stringify(settings), {
      maxAge: 365 * 24 * 60 * 60,
      path: '/'
    })
    
    // Return true to indicate the settings were reset
    return true
  }
  
  // Return false to indicate no action was taken
  return false
}

export default resetThemeSettings
