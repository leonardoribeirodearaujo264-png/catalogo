import type { NextConfig } from "next";

// O host das imagens é o Storage do próprio projeto Supabase — derivado da
// env, para não deixar o domínio de um projeto específico fixo no código.
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  // Há um package-lock.json na pasta do usuário acima deste projeto; sem
  // fixar a raiz, o Turbopack elege a pasta errada como workspace root.
  turbopack: { root: __dirname },
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
