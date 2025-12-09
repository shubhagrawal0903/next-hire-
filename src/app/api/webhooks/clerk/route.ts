import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { clerkClient } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  // Get the webhook secret from environment variables
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set in environment variables')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    )
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    )
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload)

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  // Verify the webhook signature
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return NextResponse.json(
      { error: 'Webhook verification failed' },
      { status: 400 }
    )
  }

  // Handle the webhook event
  const eventType = evt.type

  if (eventType === 'user.created') {
    try {
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      // Get the primary email address
      const primaryEmail = email_addresses.find((email) => email.id === evt.data.primary_email_address_id)
      
      if (!primaryEmail) {
        console.error('No primary email found for user:', id)
        return NextResponse.json(
          { error: 'No primary email found' },
          { status: 400 }
        )
      }

      console.log('[Webhook] Creating user profile for:', id)

      // Create UserProfile record in Prisma
      const userProfile = await prisma.userProfile.create({
        data: {
          userId: id,
          headline: null,
          bio: null,
          location: null,
          skills: [],
          experience: [],
          education: [],
          socialLinks: null,
        },
      })

      console.log('[Webhook] UserProfile created:', userProfile.id)

      // Update Clerk user metadata with default APPLICANT role
      const client = await clerkClient()
      await client.users.updateUserMetadata(id, {
        publicMetadata: {
          role: 'APPLICANT',
        },
      })

      console.log('[Webhook] User role set to APPLICANT for:', id)

      return NextResponse.json(
        { 
          message: 'User created successfully',
          userId: id,
          email: primaryEmail.email_address,
          role: 'APPLICANT'
        },
        { status: 201 }
      )
    } catch (error) {
      console.error('[Webhook] Error creating user:', error)
      return NextResponse.json(
        { error: 'Failed to create user', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }
  }

  // Return success for other event types
  return NextResponse.json({ message: 'Webhook received' }, { status: 200 })
}
