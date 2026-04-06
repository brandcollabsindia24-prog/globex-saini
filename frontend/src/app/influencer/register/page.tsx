'use client'

import React from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './InfluencerRegister.module.css'
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
    formState: { errors },
  } = useForm<RegisterForm>()

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true)
      setVerificationMessage('')

      const res = await fetch(`${apiBaseUrl}/api/influencer/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) throw new Error(json.message || 'Registration failed')

      if (json.requiresEmailVerification) {
        setVerificationEmail(data.email)
        setVerificationMessage('Check your email for the OTP, then verify below.')
        return
      }

      alert('Influencer account created successfully')

      router.push('/influencer/login')
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
      const res = await fetch(`${apiBaseUrl}/api/influencer/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: verificationEmail, otp }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'OTP verification failed')

      alert('Email verified successfully')
      router.push('/influencer/login')
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
              CREATOR ONBOARDING
            </p>
            <h2 className={styles.panelTitle}>
              Build your profile. Win better campaigns.
            </h2>
            <p className={styles.panelText}>
              Join as an influencer and discover brand collaborations that fit your niche.
            </p>
          </div>
          <div className={styles.panelNote}>
            Stand out with your portfolio, audience insights, and consistent campaign performance.
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.badge}>
            CREATOR PORTAL
          </p>
          <h1 className={styles.title}>Create your account</h1>
          <p className={styles.subtitle}>
            Start applying to brand campaigns with your influencer profile.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                placeholder="Your full name"
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
                placeholder="you@creator.com"
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
                onClick={() => router.push('/influencer/login')}
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
            <Link
              href="/influencer/login"
              className={styles.footerLink}
            >
              Login
            </Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
