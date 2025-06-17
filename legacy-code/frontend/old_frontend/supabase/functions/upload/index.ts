
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.23.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get request data
    const { fileName, contentType } = await req.json();
    
    if (!fileName || !contentType) {
      return new Response(
        JSON.stringify({ error: "Missing fileName or contentType" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Create a Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check if the media bucket exists, if not create it
    const { data: buckets } = await supabase.storage.listBuckets();
    if (!buckets?.some(bucket => bucket.name === "media")) {
      const { error: bucketError } = await supabase.storage.createBucket("media", {
        public: true,
      });
      
      if (bucketError) {
        console.error("Error creating bucket:", bucketError);
        return new Response(
          JSON.stringify({ error: "Failed to create storage bucket" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 500,
          }
        );
      }
    }
    
    // Generate a signed URL for uploading
    const { data, error } = await supabase.storage.from("media").createSignedUploadUrl(fileName);
    
    if (error || !data) {
      console.error("Error creating signed URL:", error);
      return new Response(
        JSON.stringify({ error: "Failed to create signed upload URL" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        }
      );
    }
    
    // Get the public URL for the file
    const { data: publicUrlData } = supabase.storage.from("media").getPublicUrl(fileName);
    
    return new Response(
      JSON.stringify({
        signedUrl: data.signedUrl,
        path: data.path,
        publicUrl: publicUrlData.publicUrl,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
