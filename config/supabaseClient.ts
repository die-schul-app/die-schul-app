import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://dmzgmsqgjvdbtbmgsong.supabase.co"
const supabaseKey ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtemdtc3FnanZkYnRibWdzb25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MDgwMDUsImV4cCI6MjA2NDk4NDAwNX0.rZIwf7mPwtAPNaErniEDfX3GJyMuxQnaFMgaQw-74i8"
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase