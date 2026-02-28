import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        // Extract basic Firebase user ID info from token/header for now
        const token = authHeader.slice(7)
        const userId = token // For simplicity in this demo, front-end passes UID directly or we decode

        const formData = await request.formData()
        const category = formData.get('category') as string
        const roomNo = formData.get('roomNo') as string
        const description = formData.get('description') as string
        const imageFile = formData.get('imageFile') as File | null

        if (!category || !roomNo || !description) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        let image_url = null

        if (imageFile) {
            const ext = imageFile.name.split('.').pop()
            const fileName = `${userId}/${Date.now()}.${ext}`

            const arrayBuffer = await imageFile.arrayBuffer()
            const buffer = new Uint8Array(arrayBuffer)

            const { error: uploadError } = await supabaseAdmin.storage
                .from('complaint-images')
                .upload(fileName, buffer, {
                    contentType: imageFile.type,
                })

            if (!uploadError) {
                const { data: urlData } = supabaseAdmin.storage
                    .from('complaint-images')
                    .getPublicUrl(fileName)
                image_url = urlData.publicUrl
            } else {
                console.error("Storage upload error:", uploadError)
                return NextResponse.json({ error: 'Failed to upload image', details: uploadError.message }, { status: 500 })
            }
        }

        // Ensure the user exists in profiles table before inserting the complaint
        // Try getting existing profile, or insert empty row if missing (lazy initialization)
        const { data: existingProfile } = await supabaseAdmin.from('profiles').select('id').eq('id', userId).single()

        if (!existingProfile) {
            console.log("Profile not found, lazy-creating profile for ID:", userId)
            const { error: profileError } = await supabaseAdmin.from('profiles').insert({ id: userId, email: 'unknown@example.com' })
            if (profileError) {
                console.error("Failed to lazy-create profile:", profileError)
                return NextResponse.json({ error: 'Failed to initialize user profile', details: profileError.message }, { status: 500 })
            }
        }

        const { data, error } = await supabaseAdmin.from('complaints').insert({
            user_id: userId,
            category,
            room_no: roomNo,
            description,
            image_url: image_url || null, // Ensure it's optional
            status: 'pending'
        }).select().single()

        if (error) {
            console.error("DB insert error:", error)
            return NextResponse.json({ error: 'Database insert failed', details: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })

    } catch (error: any) {
        console.error('Complaint POST error:', error)
        return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 })
    }
}
