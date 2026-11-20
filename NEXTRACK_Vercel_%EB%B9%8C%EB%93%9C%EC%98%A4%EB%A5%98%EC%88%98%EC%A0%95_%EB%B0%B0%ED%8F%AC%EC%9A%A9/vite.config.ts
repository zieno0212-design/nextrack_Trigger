import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {petitionFeedPlugin} from './livePetitions'
import {seongbokFollowupPlugin} from './seongbokFollowupServer'
export default defineConfig({plugins:[react(),petitionFeedPlugin(),seongbokFollowupPlugin()],server:{proxy:{'/api/track':{target:'http://127.0.0.1:8787',changeOrigin:true}}}})
