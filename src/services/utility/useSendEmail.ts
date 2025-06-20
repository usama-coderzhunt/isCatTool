// hooks/useSendEmail.ts
import { useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  message: string
  attachments?: File | null
}

export const useSendEmail = () => {
  const [loading, setLoading] = useState(false)

  const sendEmail = async (form: ContactFormData) => {
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', form.name)
      formData.append('email', form.email)
      formData.append('message', form.message)
      if (form.phone) formData.append('phone', form.phone)
      if (form.attachments) formData.append('attachments', form.attachments)

      const res = await axios.post('{{base_url}}/api/emails/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success(res.data.message || 'Email sent successfully!')
      return true
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Something went wrong!'
      toast.error(`Error: ${msg}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  return { sendEmail, loading }
}
