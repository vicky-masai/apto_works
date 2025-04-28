import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t bg-white">
      <div className="container mx-auto h-19 flex items-center justify-center">
        <p className="text-center font-semibold text-base text-gray-700">
          © 2025 AptoWorks. All rights reserved.
        </p>
        {/* <div className="flex items-center gap-4">
          <Link href="/terms" className="text-sm text-gray-500 underline-offset-4 hover:underline">
            Terms
          </Link>
          <Link href="/privacy" className="text-sm text-gray-500 underline-offset-4 hover:underline">
            Privacy
          </Link>
        </div> */}
      </div>
    </footer>
  )
} 