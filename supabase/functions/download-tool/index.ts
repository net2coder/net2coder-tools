// supabase/functions/download-tool/index.ts
//
// Edge Function: Secure ZIP download
// URL: POST /functions/v1/download-tool
// Body: { version_id: string, tool_id: string }
//
// Flow:
//   1. Validate version_id and tool_id exist and are published
//   2. Atomically increment download counter + insert log via RPC
//   3. Generate 60-second signed URL for the private tool-zips bucket
//   4. Return signed URL to frontend
//
// Deploy: supabase functions deploy download-tool

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const { version_id, tool_id } = await req.json()

    if (!version_id || !tool_id) {
      return new Response(JSON.stringify({ error: 'version_id and tool_id are required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use service role key for privileged operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } }
    )

    // 1. Verify the version exists and belongs to a published tool
    const { data: version, error: vErr } = await supabase
      .from('versions')
      .select('id, zip_path, tool_id, tools!inner(id, status)')
      .eq('id', version_id)
      .eq('tool_id', tool_id)
      .single()

    if (vErr || !version) {
      return new Response(JSON.stringify({ error: 'Version not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check tool is published
    const tool = (version as any).tools
    if (!tool || tool.status !== 'published') {
      return new Response(JSON.stringify({ error: 'Tool is not published' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Atomically increment counter + insert log
    const { error: rpcErr } = await supabase.rpc('increment_download', {
      p_version_id: version_id,
      p_tool_id:    tool_id,
    })

    if (rpcErr) {
      console.error('increment_download RPC error:', rpcErr)
      // Don't block download on tracking failure - just log it
    }

    // 3. Generate 60-second signed URL
    const { data: signedData, error: signErr } = await supabase
      .storage
      .from('tool-zips')
      .createSignedUrl(version.zip_path, 60)

    if (signErr || !signedData?.signedUrl) {
      console.error('Signed URL error:', signErr)
      return new Response(JSON.stringify({ error: 'Failed to generate download URL' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. Return signed URL
    return new Response(
      JSON.stringify({
        url:        signedData.signedUrl,
        expires_in: 60,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (err) {
    console.error('Unexpected error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
