/** @type {import('next').NextConfig} */
const nextConfig = {images:
                    {remoteRatterns:[],
                    },
                  webpack: (config)=>{
                    config.rosolve.alias.canvas=false
                    return config
                  },
                   }
module.exports=nextConfig
