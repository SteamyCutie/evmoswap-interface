import Document, { Head, Html, Main, NextScript } from 'next/document'

import { ServerStyleSheet } from 'styled-components'

const APP_NAME = 'EvmoSwap'
const APP_DESCRIPTION = 'Swap, yield, lend, borrow, leverage, limit, launch all on one community driven ecosystem'
export default class MyDocument extends Document {
    static async getInitialProps ( ctx ) {
        const sheet = new ServerStyleSheet()
        const originalRenderPage = ctx.renderPage

        try {
            ctx.renderPage = () =>
                originalRenderPage( {
                    enhanceApp: ( App ) => ( props ) => sheet.collectStyles( <App { ...props } /> ),
                } )

            const initialProps = await Document.getInitialProps( ctx )
            return {
                ...initialProps,
                styles: (
                    <>
                        { initialProps.styles }
                        { sheet.getStyleElement() }
                    </>
                ),
            }
        } finally {
            sheet.seal()
        }
    }

    render () {
        return (
            <Html lang="en" dir="ltr">
                <Head>
                    <meta name="application-name" content={ APP_NAME } />
                    <meta name="apple-mobile-web-app-capable" content="yes" />
                    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                    <meta name="apple-mobile-web-app-title" content={ APP_NAME } />
                    <meta name="description" content={ APP_DESCRIPTION } />
                    <meta name="format-detection" content="telephone=no" />
                    <meta name="mobile-web-app-capable" content="yes" />
                    <meta name="theme-color" content="#000000" />
                    <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
                    <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />

                    <link rel="manifest" href="/manifest.json" />
                    <link rel="shortcut icon" href="/favicon.ico" />
                </Head>
                <body className='text-dark dark:text-light'>
                    <Main />
                    <NextScript />
                </body>
            </Html>
        )
    }
}
