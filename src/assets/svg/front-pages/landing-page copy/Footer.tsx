import React from 'react'

const Footer = () => {
  return (
    <footer
      className='relative bg-cover bg-center text-white py-12'
      style={{
        backgroundImage: `url('/images/front-pages/landing-page/footer-bg-light.png')`
      }}
    >
      {/* Overlay for better text readability */}
      <div className='absolute inset-0 bg-gray-950 opacity-85'></div>

      {/* Footer Content */}
      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Company Information */}
          <div className='flex flex-col gap-4'>
            <h2 className='text-2xl font-bold'>YourCompany</h2>
            <p className='text-sm'>
              Empowering businesses with innovative solutions since 2020. We are committed to excellence and customer
              satisfaction.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Quick Links</h3>
            <ul className='flex flex-col gap-2'>
              <li>
                <a href='/' className='text-sm hover:underline'>
                  Home
                </a>
              </li>
              <li>
                <a href='/about' className='text-sm hover:underline'>
                  About Us
                </a>
              </li>
              <li>
                <a href='/services' className='text-sm hover:underline'>
                  Services
                </a>
              </li>
              <li>
                <a href='/contact' className='text-sm hover:underline'>
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Contact Us</h3>
            <ul className='flex flex-col gap-2 text-sm'>
              <li>
                Email:{' '}
                <a href='mailto:info@yourcompany.com' className='hover:underline'>
                  info@yourcompany.com
                </a>
              </li>
              <li>
                Phone:{' '}
                <a href='tel:+1234567890' className='hover:underline'>
                  +1 (234) 567-890
                </a>
              </li>
              <li>Address: 123 Innovation Street, Tech City, TC 12345</li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className='text-lg font-semibold mb-4'>Follow Us</h3>
            <ul className='flex flex-col gap-2 text-sm'>
              <li>
                <a
                  href='https://twitter.com/yourcompany'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href='https://facebook.com/yourcompany'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  Facebook
                </a>
              </li>
              <li>
                <a
                  href='https://linkedin.com/company/yourcompany'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a
                  href='https://instagram.com/yourcompany'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='mt-8 pt-8 border-t border-gray-600 text-center'>
          <p className='text-sm'>&copy; {new Date().getFullYear()} YourCompany. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
