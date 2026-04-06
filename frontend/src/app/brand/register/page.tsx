








'use client'

import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './BrandRegister.module.css'
import Footer from '@/components/Footer'
import { resolveApiBaseUrl } from '../../../lib/authStorage'

type RegisterForm = {
  name: string
  email: string
  password: string
}

export default function Page() {
  const router = useRouter()
  const apiBaseUrl = resolveApiBaseUrl()
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)
  const [otp, setOtp] = useState('')
  const [verificationMessage, setVerificationMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterForm>()

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true)
      setVerificationMessage('')

      const res = await fetch(`${apiBaseUrl}/api/brand/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json.message || 'Registration failed')

      if (json.requiresEmailVerification) {
        setVerificationEmail(data.email)
        setVerificationMessage('Check your email for the OTP, then verify below.')
        return
      }

      alert('Account created successfully')
      router.push('/brand/login')

    } catch (err: any) {
      alert(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!verificationEmail) return

    try {
      setLoading(true)
      const res = await fetch(`${apiBaseUrl}/api/brand/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: verificationEmail, otp })
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'OTP verification failed')

      alert('Email verified successfully')
      router.push('/brand/login')
    } catch (err: any) {
      alert(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.glowOne} />
      <div className={styles.glowTwo} />

      <div className={styles.shell}>
        <div className={styles.panel}>
          <div>
            <p className={styles.panelBadge}>
              BRAND ONBOARDING
            </p>
            <h2 className={styles.panelTitle}>
              Launch your first campaign in minutes.
            </h2>
            <p className={styles.panelText}>
              Join the platform and connect with influencers that match your audience.
            </p>
          </div>
          <div className={styles.panelNote}>
            Trusted by growth teams to find creators, manage briefs, and scale brand reach.
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.badge}>
            BRAND PORTAL
          </p>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>
            Register your brand to launch campaigns and collaborate with creators.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                placeholder="Brand name"
                {...register('name', { required: 'Name required' })}
                className={styles.input}
              />
              {errors.name && (
                <p className={styles.error}>{errors.name.message}</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                placeholder="you@brand.com"
                {...register('email', { required: 'Email required' })}
                className={styles.input}
              />
              {errors.email && (
                <p className={styles.error}>{errors.email.message}</p>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                {...register('password', { required: 'Password required' })}
                className={styles.input}
              />
              {errors.password && (
                <p className={styles.error}>{errors.password.message}</p>
              )}
            </div>

            <div className={styles.buttonRow}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={loading || Boolean(verificationEmail)}
              >
                {loading ? 'Working...' : 'Register'}
              </button>

              <button
                type="button"
                onClick={() => router.push('/brand/login')}
                className={styles.secondaryButton}
              >
                Go to Login
              </button>
            </div>
          </form>

          {verificationEmail && (
            <div className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Verification OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter the 6-digit code"
                  className={styles.input}
                />
              </div>
              <button
                type="button"
                onClick={verifyOtp}
                className={styles.primaryButton}
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
              {verificationMessage && <p className={styles.subtitle}>{verificationMessage}</p>}
            </div>
          )}

          <p className={styles.footerText}>
            Already have an account?{' '}
            <Link href="/brand/login" className={styles.footerLink}>
              Login
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}