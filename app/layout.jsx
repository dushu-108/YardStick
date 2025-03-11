import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "./components/theme-provider"
import { ThemeToggle } from "./components/theme-toggle"

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Yardstick',
  description: 'Measure your progress',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-950`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            <header className="border-b dark:border-gray-800 bg-white dark:bg-black">
              <div className="container flex h-16 items-center justify-between px-4">
                <h1 className="text-2xl font-bold dark:text-gray-100">Yardstick</h1>
                <ThemeToggle />
              </div>
            </header>
            <main className="container py-6 px-4">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}