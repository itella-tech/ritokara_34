import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { uploadPDFFile, uploadAudioFile } from '@/lib/storage'

export const useFiles = () => {
  const queryClient = useQueryClient()

  const getPDFFiles = () => {
    return useQuery({
      queryKey: ['pdf-files'],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('pdf_files')
          .select('*')
          .order('display_order')
        
        if (error) throw error
        return data
      }
    })
  }

  const getAudioFiles = (pdfPageId: string) => {
    return useQuery({
      queryKey: ['audio-files', pdfPageId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('audio_files')
          .select('*')
          .eq('pdf_page_id', pdfPageId)
        
        if (error) throw error
        return data
      }
    })
  }

  const uploadPDF = useMutation({
    mutationFn: async ({ 
      file, 
      title, 
      description 
    }: { 
      file: File
      title: string
      description?: string 
    }) => {
      const filePath = await uploadPDFFile(file)
      const { data, error } = await supabase
        .from('pdf_files')
        .insert({
          title,
          description,
          file_path: filePath,
          is_public: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf-files'] })
    }
  })

  const uploadAudio = useMutation({
    mutationFn: async ({ 
      file, 
      pdfPageId, 
      language 
    }: { 
      file: File
      pdfPageId: string
      language: string 
    }) => {
      const filePath = await uploadAudioFile(file, language)
      const { data, error } = await supabase
        .from('audio_files')
        .insert({
          pdf_page_id: pdfPageId,
          language,
          file_path: filePath
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['audio-files', variables.pdfPageId] 
      })
    }
  })

  return {
    getPDFFiles,
    getAudioFiles,
    uploadPDF,
    uploadAudio
  }
}