import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0 bg-white">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-gray-500 md:text-left">
          © 2025 TaskHub. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm text-gray-500 underline-offset-4 hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-gray-500 underline-offset-4 hover:underline">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  )
} 