/** @type {import('next').NextConfig} */
const nextConfig = {images:
                    {remotePatterns:[],
                    },
                  webpack: (config)=>{
                    config.rosolve.alias.canvas = false
                    return config
                  },
                   }
module.exports=nextConfig
