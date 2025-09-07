import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // This is a workaround to confirm users manually
    // In production, you'd want proper authentication for this endpoint
    console.log('Attempting to confirm user:', email)

    // Get the user by email
    const { data: users, error: fetchError } = await supabase.auth.admin.listUsers()
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    const user = users.users.find(u => u.email === email)
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Confirm the user
    const { data, error: confirmError } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirm: true,
        // Set confirmation timestamp
        user_metadata: {
          ...user.user_metadata,
          email_confirmed: true
        }
      }
    )

    if (confirmError) {
      console.error('Error confirming user:', confirmError)
      return NextResponse.json({ error: confirmError.message }, { status: 500 })
    }

    console.log('User confirmed successfully:', data.user?.email)
    return NextResponse.json({ 
      success: true, 
      message: 'User confirmed successfully',
      user: data.user?.email 
    })

  } catch (error: any) {
    console.error('Confirm user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
