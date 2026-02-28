'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/firebase/AuthContext'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import Link from 'next/link'

const categories = [
    { value: 'bench', label: '🪑 Bench / Furniture' },
    { value: 'projector', label: '📽️ Projector / Display' },
    { value: 'door', label: '🚪 Door / Lock' },
    { value: 'electrical', label: '⚡ Electrical / Wiring' },
    { value: 'other', label: '🔧 Other' },
]

export default function NewComplaintPage() {
    const { user: firebaseUser } = useAuth()
    const router = useRouter()
    const [category, setCategory] = useState('')
    const [roomNo, setRoomNo] = useState('')
    const [description, setDescription] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB')
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!category || !roomNo || !description) {
            toast.error('Please fill all required fields')
            return
        }

        setLoading(true)

        try {
            const supabase = createClient()
            if (!firebaseUser) throw new Error('Not authenticated')

            let image_url = null

            // Upload image if provided
            if (imageFile) {
                const ext = imageFile.name.split('.').pop()
                const fileName = `${firebaseUser.uid}/${Date.now()}.${ext}`
                const { error: uploadError } = await supabase.storage
                    .from('complaint-images')
                    .upload(fileName, imageFile)

                if (!uploadError) {
                    const { data: urlData } = supabase.storage
                        .from('complaint-images')
                        .getPublicUrl(fileName)
                    image_url = urlData.publicUrl
                }
            }

            const { error } = await supabase.from('complaints').insert({
                user_id: firebaseUser.uid,
                category,
                room_no: roomNo,
                description,
                image_url,
            })

            if (error) throw error

            toast.success('Complaint submitted successfully!')
            router.push('/complaints')
        } catch (err) {
            toast.error('Failed to submit complaint. Please try again.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            <Link href="/complaints" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to complaints
            </Link>

            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardHeader>
                    <CardTitle className="text-xl text-white">Report an Issue</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-slate-300">Category *</Label>
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-700">
                                    {categories.map(c => (
                                        <SelectItem key={c.value} value={c.value} className="text-slate-200 focus:bg-slate-700">
                                            {c.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Room Number *</Label>
                            <Input
                                value={roomNo}
                                onChange={(e) => setRoomNo(e.target.value)}
                                placeholder="e.g., Room 204, Lab 3"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Description *</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe the issue in detail..."
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 min-h-[100px]"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Photo (optional)</Label>
                            {imagePreview ? (
                                <div className="relative w-full h-48 rounded-xl overflow-hidden border border-slate-600">
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setImageFile(null); setImagePreview(null) }}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-slate-900/80 flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-blue-500/50 hover:bg-slate-700/20 transition-all">
                                    <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                                    <span className="text-sm text-slate-500">Click to upload a photo</span>
                                    <span className="text-xs text-slate-600 mt-1">JPG or PNG, max 5MB</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Upload className="w-4 h-4" /> Submit Complaint
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
