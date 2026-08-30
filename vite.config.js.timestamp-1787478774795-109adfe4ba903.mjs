// vite.config.js
import { defineConfig } from "file:///C:/Users/HP/Downloads/NO-EXCUSE/Dashboard/Current%20Build/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/HP/Downloads/NO-EXCUSE/Dashboard/Current%20Build/node_modules/@vitejs/plugin-react/dist/index.js";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/HP/Downloads/NO-EXCUSE/Dashboard/Current%20Build/vite.config.js";
var vite_config_default = defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url)),
      "@components": fileURLToPath(new URL("./src/components", __vite_injected_original_import_meta_url)),
      "@pages": fileURLToPath(new URL("./src/pages", __vite_injected_original_import_meta_url)),
      "@context": fileURLToPath(new URL("./src/context", __vite_injected_original_import_meta_url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", __vite_injected_original_import_meta_url)),
      "@services": fileURLToPath(new URL("./src/services", __vite_injected_original_import_meta_url)),
      "@app-types": fileURLToPath(new URL("./src/types", __vite_injected_original_import_meta_url)),
      "@constants": fileURLToPath(new URL("./src/constants", __vite_injected_original_import_meta_url)),
      "@utils": fileURLToPath(new URL("./src/utils", __vite_injected_original_import_meta_url)),
      "@assets": fileURLToPath(new URL("./src/assets", __vite_injected_original_import_meta_url)),
      "@routes": fileURLToPath(new URL("./src/routes", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    port: 5173,
    open: true,
    strictPort: true
  },
  preview: {
    port: 4173
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    chunkSizeWarningLimit: 1e3,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/database"],
          animation: ["framer-motion"]
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIUFxcXFxEb3dubG9hZHNcXFxcTk8tRVhDVVNFXFxcXERhc2hib2FyZFxcXFxDdXJyZW50IEJ1aWxkXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxIUFxcXFxEb3dubG9hZHNcXFxcTk8tRVhDVVNFXFxcXERhc2hib2FyZFxcXFxDdXJyZW50IEJ1aWxkXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9IUC9Eb3dubG9hZHMvTk8tRVhDVVNFL0Rhc2hib2FyZC9DdXJyZW50JTIwQnVpbGQvdml0ZS5jb25maWcuanNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpXSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAnQCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAY29tcG9uZW50cyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvY29tcG9uZW50cycsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgJ0BwYWdlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvcGFnZXMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAY29udGV4dCc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvY29udGV4dCcsIGltcG9ydC5tZXRhLnVybCkpLFxuICAgICAgJ0Bob29rcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvaG9va3MnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAc2VydmljZXMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL3NlcnZpY2VzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGFwcC10eXBlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvdHlwZXMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAY29uc3RhbnRzJzogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuL3NyYy9jb25zdGFudHMnLCBpbXBvcnQubWV0YS51cmwpKSxcbiAgICAgICdAdXRpbHMnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjL3V0aWxzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQGFzc2V0cyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvYXNzZXRzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgICAnQHJvdXRlcyc6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi9zcmMvcm91dGVzJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICBvcGVuOiB0cnVlLFxuICAgIHN0cmljdFBvcnQ6IHRydWUsXG4gIH0sXG4gIHByZXZpZXc6IHtcbiAgICBwb3J0OiA0MTczLFxuICB9LFxuICBidWlsZDoge1xuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIHNvdXJjZW1hcDogdHJ1ZSxcbiAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDEwMDAsXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIG1hbnVhbENodW5rczoge1xuICAgICAgICAgIHZlbmRvcjogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxuICAgICAgICAgIGZpcmViYXNlOiBbJ2ZpcmViYXNlL2FwcCcsICdmaXJlYmFzZS9hdXRoJywgJ2ZpcmViYXNlL2RhdGFiYXNlJ10sXG4gICAgICAgICAgYW5pbWF0aW9uOiBbJ2ZyYW1lci1tb3Rpb24nXSxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pOyJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVcsU0FBUyxvQkFBb0I7QUFDcFksT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZSxXQUFXO0FBRmdNLElBQU0sMkNBQTJDO0FBSXBSLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLENBQUM7QUFBQSxFQUNqQixTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxLQUFLLGNBQWMsSUFBSSxJQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLE1BQ3BELGVBQWUsY0FBYyxJQUFJLElBQUksb0JBQW9CLHdDQUFlLENBQUM7QUFBQSxNQUN6RSxVQUFVLGNBQWMsSUFBSSxJQUFJLGVBQWUsd0NBQWUsQ0FBQztBQUFBLE1BQy9ELFlBQVksY0FBYyxJQUFJLElBQUksaUJBQWlCLHdDQUFlLENBQUM7QUFBQSxNQUNuRSxVQUFVLGNBQWMsSUFBSSxJQUFJLGVBQWUsd0NBQWUsQ0FBQztBQUFBLE1BQy9ELGFBQWEsY0FBYyxJQUFJLElBQUksa0JBQWtCLHdDQUFlLENBQUM7QUFBQSxNQUNyRSxjQUFjLGNBQWMsSUFBSSxJQUFJLGVBQWUsd0NBQWUsQ0FBQztBQUFBLE1BQ25FLGNBQWMsY0FBYyxJQUFJLElBQUksbUJBQW1CLHdDQUFlLENBQUM7QUFBQSxNQUN2RSxVQUFVLGNBQWMsSUFBSSxJQUFJLGVBQWUsd0NBQWUsQ0FBQztBQUFBLE1BQy9ELFdBQVcsY0FBYyxJQUFJLElBQUksZ0JBQWdCLHdDQUFlLENBQUM7QUFBQSxNQUNqRSxXQUFXLGNBQWMsSUFBSSxJQUFJLGdCQUFnQix3Q0FBZSxDQUFDO0FBQUEsSUFDbkU7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFdBQVc7QUFBQSxJQUNYLHVCQUF1QjtBQUFBLElBQ3ZCLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxVQUNaLFFBQVEsQ0FBQyxTQUFTLGFBQWEsa0JBQWtCO0FBQUEsVUFDakQsVUFBVSxDQUFDLGdCQUFnQixpQkFBaUIsbUJBQW1CO0FBQUEsVUFDL0QsV0FBVyxDQUFDLGVBQWU7QUFBQSxRQUM3QjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
