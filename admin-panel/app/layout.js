import { Toaster } from 'react-hot-toast'
co
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>  
        <link rel="icon" href="/logo.jpg" type="image/jpg" />
      </head>
      <body>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
        {children}
      </body>
    </html>
  )
} 