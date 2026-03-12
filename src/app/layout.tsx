import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers/Providers'
import { BRAND_CONFIG } from '@/config/brand'

const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-primary', weight: ['300', '400', '500', '600', '700', '800'] })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-heading', weight: ['300', '400', '500', '600', '700'], style: ['normal', 'italic'] })

export const metadata: Metadata = {
    title: BRAND_CONFIG.seo.title,
    description: BRAND_CONFIG.seo.description,
}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="sr" className={`${jakarta.variable} ${cormorant.variable}`}>
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
