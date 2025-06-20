'use client'
import { Box, Typography, Button } from '@mui/material'

const heroImage = '/images/pages/home_hero.jpg'

const HeroSection = () => {
  return (
    <Box className='relative w-full h-[80vh]'>
      {/* Background Image */}
      <img src={heroImage} alt='Hero' className='w-full h-full object-cover' />

      {/* Overlay Content */}
      <Box
        className='flex items-center justify-left w-full h-full absolute top-0 left-0'
        sx={{
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Black background with 50% opacity
          px: { xs: 3, md: 10 }
        }}
      >
        <Box sx={{ maxWidth: '600px', textAlign: 'center' }}>
          {/* Headline */}
          <Typography variant='h3' component='h1' fontWeight='bold' sx={{ color: 'white' }}>
            Compelling and Clear Value Proposition
          </Typography>

          {/* Subheading */}
          <Typography variant='h6' paragraph sx={{ color: 'white' }}>
            Idealistic Solutions helps businesses streamline workflows with powerful digital tools.
          </Typography>

          {/* Buttons */}
          <Box className='space-x-4'>
            <Button variant='contained' color='primary' size='large' sx={{ mt: 2 }}>
              Explore Our Services
            </Button>
            <Button variant='contained' color='primary' size='large' sx={{ mt: 2 }}>
              Get a Demo
            </Button>
            <Button variant='contained' color='primary' size='large' sx={{ mt: 2 }}>
              Contact Us
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default HeroSection
