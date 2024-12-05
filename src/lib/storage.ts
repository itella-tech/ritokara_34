import { supabase } from './supabase'

export const uploadPDFFile = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from('pdfs')
    .upload(fileName, file)

  if (error) throw error
  return data.path
}

export const uploadAudioFile = async (file: File, language: string) => {
  const fileName = `${Date.now()}-${language}-${file.name}`
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(fileName, file)

  if (error) throw error
  return data.path
}

export const getFileUrl = (bucket: 'pdfs' | 'audio', path: string) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}