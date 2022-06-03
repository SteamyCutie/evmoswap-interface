/* eslint-disable react-hooks/exhaustive-deps */
import { t } from '@lingui/macro'
import { useLingui } from '@lingui/react'
import { DiscordIcon, MediumIcon, TwitterIcon } from '../Icon'
import Image from 'next/image'
import React, { useEffect } from 'react'
import { useActiveWeb3React } from '../../services/web3'
import Polling from '../Polling'

const Footer = () => {
    const { chainId } = useActiveWeb3React()
    const { i18n } = useLingui()

    const navigation = {
        support: [
            { name: `${i18n._( t`FAQ` )}`, href: 'https://docs.evmoswap.org/' },
            { name: `${i18n._( t`Contract` )}`, href: 'https://docs.evmoswap.org/contracts/smart-contracts' },
            { name: `${i18n._( t`Tokenomics` )}`, href: 'https://docs.evmoswap.org/tokenomics/token-and-supply' },
        ],

        partner: [
            { name: `${i18n._( t`Defi Llama` )}`, href: 'https://defillama.com/protocol/evmoswap' },
            { name: `${i18n._( t`DexScreener` )}`, href: 'https://dexscreener.com/evmos/evmoswap' },
            { name: `${i18n._( t`GeckoTerminal` )}`, href: 'https://geckoterminal.com/evmos/evmoswap/pools' },
        ],

        developers: [
            { name: `${i18n._( t`Github` )}`, href: 'https://github.com/evmoswap' },
            { name: `${i18n._( t`Documentation` )}`, href: 'https://docs.evmoswap.org/' },
            { name: `${i18n._( t`Audits` )}`, href: 'https://docs.evmoswap.org/extras/security-audits' },
        ],

        business: [
            { name: `${i18n._( t`Token Listing` )}`, href: 'https://github.com/evmoswap/default-token-list' },
            { name: `${i18n._( t`Support#Discord` )}`, href: 'https://discord.gg/cEp53UXPw3' },
            { name: `${i18n._( t`Partner Application` )}`, href: 'https://discord.gg/cEp53UXPw3' },
        ],
        social: [
            {
                name: 'Twitter',
                href: 'https://twitter.com/evmoswap',
                icon: ( props: any ) => (
                    <svg { ...props } viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M23.4561 2.44298C23.0791 2.61021 22.6915 2.75134 22.2954 2.86593C22.7643 2.3356 23.1218 1.7116 23.3401 1.02876C23.389 0.875706 23.3383 0.70817 23.2125 0.608067C23.0869 0.507887 22.9123 0.495887 22.7739 0.577874C21.9328 1.07676 21.0253 1.43529 20.0737 1.64494C19.1152 0.708325 17.8133 0.175293 16.4674 0.175293C13.6265 0.175293 11.3152 2.48649 11.3152 5.32732C11.3152 5.55106 11.3294 5.77356 11.3574 5.99297C7.83215 5.68345 4.55475 3.95073 2.30417 1.19003C2.22396 1.09163 2.1004 1.0386 1.9739 1.04874C1.84732 1.05865 1.73359 1.13003 1.66964 1.23973C1.21318 2.02298 0.971862 2.9188 0.971862 3.83026C0.971862 5.07168 1.41509 6.24954 2.19803 7.1699C1.95996 7.08745 1.72895 6.9844 1.50846 6.862C1.39008 6.79612 1.24562 6.79713 1.12802 6.86456C1.01034 6.93199 0.936558 7.05602 0.933462 7.19158C0.93292 7.21442 0.93292 7.23725 0.93292 7.2604C0.93292 9.11343 1.93024 10.7817 3.45501 11.691C3.32402 11.678 3.1931 11.659 3.06304 11.6341C2.92895 11.6085 2.79106 11.6555 2.70064 11.7578C2.61006 11.86 2.58009 12.0024 2.62182 12.1325C3.18621 13.8945 4.63929 15.1906 6.39594 15.5858C4.93898 16.4983 3.27284 16.9763 1.52378 16.9763C1.15883 16.9763 0.791784 16.9549 0.432558 16.9124C0.254107 16.8911 0.0834745 16.9965 0.0227003 17.1662C-0.0380739 17.336 0.026339 17.5253 0.178158 17.6226C2.4251 19.0633 5.02322 19.8248 7.69147 19.8248C12.9369 19.8248 16.2184 17.3512 18.0474 15.2762C20.3282 12.6887 21.6362 9.26394 21.6362 5.88002C21.6362 5.73865 21.6341 5.59589 21.6297 5.45359C22.5296 4.77563 23.3043 3.95514 23.9348 3.01209C24.0305 2.86887 24.0201 2.67958 23.9092 2.54773C23.7984 2.41581 23.6138 2.37315 23.4561 2.44298Z"
                            fill="currentColor"
                        />
                    </svg>
                ),
            },
            {
                name: 'GitHub',
                href: 'https://github.com/evmoswap',
                icon: ( props: any ) => (
                    <svg { ...props } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M12 0C5.25 0 0 5.25 0 12C0 19.875 7.125 23.25 8.25 23.25C9 23.25 9 22.875 9 22.5V20.625C6.375 21.375 5.25 19.875 4.875 18.75C4.875 18.75 4.875 18.375 4.125 17.625C3.75 17.25 2.25 16.5 3.75 16.5C4.875 16.5 5.625 18 5.625 18C6.75 19.5 8.25 19.125 9 18.75C9 18 9.75 17.25 9.75 17.25C6.75 16.875 4.5 15.75 4.5 11.625C4.5 10.125 4.875 9 5.625 8.25C5.625 8.25 4.875 6.75 5.625 4.875C5.625 4.875 7.5 4.875 9 6.375C10.125 5.625 13.875 5.625 15 6.375C16.5 4.875 18.375 4.875 18.375 4.875C19.125 7.5 18.375 8.25 18.375 8.25C19.125 9 19.5 10.125 19.5 11.625C19.5 15.75 16.875 16.875 14.25 17.25C14.625 17.625 15 18.375 15 19.5V22.5C15 22.875 15 23.25 15.75 23.25C16.875 23.25 24 19.875 24 12C24 5.25 18.75 0 12 0Z"
                            fill="currentColor"
                        />
                    </svg>
                ),
            },
            {
                name: 'Medium',
                href: 'https://evmoswap.medium.com/',
                icon: ( props: any ) => (
                    <svg { ...props } viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M2.372 3.264C2.38425 3.14227 2.36784 3.01935 2.32408 2.9051C2.28033 2.79084 2.21043 2.68841 2.12 2.606L0.252 0.339V0H6.05L10.532 9.905L14.472 0H20V0.339L18.403 1.88C18.3353 1.93225 18.2831 2.00189 18.2519 2.0815C18.2208 2.16111 18.2118 2.24769 18.226 2.332V13.666C18.2118 13.7503 18.2208 13.8369 18.2519 13.9165C18.2831 13.9961 18.3353 14.0658 18.403 14.118L19.963 15.66V16H12.12V15.661L13.735 14.081C13.894 13.921 13.894 13.874 13.894 13.63V4.468L9.402 15.962H8.796L3.566 4.468V12.172C3.523 12.496 3.63 12.822 3.856 13.056L5.957 15.624V15.962H0V15.624L2.1 13.056C2.21111 12.9401 2.29358 12.7997 2.3408 12.6462C2.38803 12.4928 2.39871 12.3304 2.372 12.172V3.264Z"
                            fill="currentColor"
                        />
                    </svg>
                ),
            },
            {
                name: 'Discord',
                href: 'https://discord.gg/cEp53UXPw3',
                icon: ( props: any ) => (
                    <svg { ...props } viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M7.07129 12.364C7.07129 11.5089 7.68383 10.9404 8.30988 10.9404C8.94804 10.9404 9.56239 11.5194 9.54871 12.3499L9.5486 12.364C9.5486 13.2192 8.93606 13.7877 8.30988 13.7877C7.69918 13.7877 7.07129 13.2136 7.07129 12.364Z"
                            fill="currentColor"
                        />
                        <path
                            d="M14.5713 12.3638C14.5713 11.9115 14.709 11.5964 14.8823 11.4048C15.0484 11.221 15.2975 11.093 15.6574 11.093C16.2834 11.093 16.8961 11.6615 16.8961 12.5166C16.8961 13.3718 16.2834 13.9403 15.6574 13.9403C15.4025 13.9403 15.1518 13.8162 14.9377 13.5333C14.7176 13.2426 14.5713 12.8195 14.5713 12.3638Z"
                            fill="currentColor"
                        />
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.07888 19.4269C6.52299 19.6002 7.01299 19.7743 7.54845 19.9348C6.60514 20.9143 5.14286 22.2858 5.14286 22.2858C0.601648 22.142 0 18.4228 0 18.4228C0 11.8064 2.95888 3.8718 2.95888 3.8718C5.91776 1.65262 8.7328 1.71428 8.7328 1.71428L8.99349 3.46726C7.63 3.82996 6.23238 4.42951 4.7325 5.24751L5.5533 6.75252C8.02714 5.40337 10.0418 4.77388 12.0041 4.77291C13.9658 4.77193 15.9775 5.39913 18.4453 6.75167L19.2691 5.24836C17.6962 4.38627 16.2354 3.76763 14.8077 3.41231L15.2671 1.71441C15.2671 1.71441 18.0821 1.65262 21.041 3.87195C21.041 3.87195 24 11.8064 24 18.4228C24 18.4228 23.3982 22.142 18.8571 22.2858C18.8571 22.2858 17.4917 20.9391 16.5891 19.9685C17.0629 19.8231 17.5419 19.6495 18.0277 19.446C18.8032 19.1567 19.6566 18.7386 20.5467 18.1524L19.6038 16.7207C18.8157 17.2397 18.0725 17.6008 17.4141 17.8452L17.4032 17.8492L17.3947 17.8525L17.3803 17.8584C16.4091 18.2666 15.4857 18.5346 14.589 18.6874L14.575 18.69C12.7268 19.0364 11.0282 18.9416 9.5708 18.6698C8.46352 18.4557 7.50858 18.1445 6.70286 17.8301C5.89669 17.5146 5.20691 17.181 4.53946 16.7138L3.55643 18.1183C4.37238 18.6893 5.19589 19.0813 6.07806 19.4266L6.07888 19.4269ZM8.31002 9.22609C6.59368 9.22609 5.35714 10.7123 5.35714 12.3639C5.35714 14.0214 6.61934 15.5019 8.31002 15.5019C10.024 15.5019 11.2595 14.0199 11.263 12.371C11.2869 10.6976 10.0118 9.22609 8.31002 9.22609ZM15.6574 9.37883C14.8459 9.37883 14.1234 9.68812 13.6107 10.255C13.1052 10.8141 12.8569 11.5629 12.8569 12.3639C12.8569 13.1617 13.107 13.9555 13.5708 14.5682C14.0406 15.1887 14.7616 15.6547 15.6574 15.6547C17.3738 15.6547 18.6102 14.1684 18.6102 12.5167C18.6102 10.865 17.3738 9.37883 15.6574 9.37883Z"
                            fill="currentColor"
                        />
                    </svg>
                ),
            },
        ],
    }

    useEffect( () => {
        if (
            localStorage.getItem( 'color-theme' ) === 'dark' ||
            ( !( 'color-theme' in localStorage ) && window.matchMedia( '(prefers-color-scheme: dark)' ).matches )
        ) {
            handleDarkTheme()
        } else {
            handleLightTheme()
        }
    }, [] )

    const handleClearTheme = () => {
        document.documentElement.classList.remove( 'dark' )
        document.documentElement.classList.remove( 'light' )
    }
    const handleDarkTheme = () => {
        handleClearTheme()
        document.documentElement.classList.add( 'dark' )
        localStorage.setItem( 'color-theme', 'dark' )
    }
    const handleLightTheme = () => {
        handleClearTheme()
        document.documentElement.classList.add( 'light' )
        localStorage.setItem( 'color-theme', 'light' )
    }

    return (
        <footer
            className="z-0 w-full max-w-screen-2xl p-0 mt-0 bg-light-primary dark:bg-dark-primary transition-all"
            aria-labelledby="footer-heading"
        >
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="px-4 py-12 pb-28 mx-0.5 sm:px-6 lg:py-8 lg:px-12">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-15 xl:gap-48">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="grid dark:hidden">
                                <Image src="/logo.svg" alt="light logo" width="191px" height="33px" />
                            </div>
                            <div className="hidden dark:grid">
                                <Image src="/logo-dark.svg" alt="dark logo" width="191px" height="33px" />
                            </div>
                            <div className="flex space-x-0 w-[90px] h-[30px] p-1 bg-light-secondary dark:bg-dark-secondary rounded-md transition-colors">
                                <div
                                    className="w-[42.5px] h-[22px] items-center justify-center select-none cursor-pointer flex rounded-[4px] bg-transparent dark:bg-dark-primary transition-colors hover:bg-dark-primary/20"
                                    onClick={ handleDarkTheme }
                                >
                                    <Image src="/moon.png" alt="moon" width={ 14 } height={ 14 } />
                                </div>
                                <div
                                    className="w-[42.5px] h-[22px] items-center justify-center select-none cursor-pointer flex rounded-[4px] bg-light-primary dark:bg-transparent transition-colors dark:hover:bg-light-primary/10"
                                    onClick={ handleLightTheme }
                                >
                                    <Image src="/sun.png" alt="sun" width={ 14 } height={ 14 } />
                                </div>
                            </div>
                        </div>
                        <p className="text-sm text-dark-primary dark:text-light-primary transition-all">
                            { i18n._(
                                t`EvmoSwap is a Decentralized Autonomous Organization (DAO) that offers a full suite of tools to explore and engage with decentralized finance opportunities.`
                            ) }
                        </p>
                        <div className="flex space-x-6">
                            { navigation.social.map( ( item ) => (
                                <a
                                    key={ item.name }
                                    href={ item.href }
                                    className="transition-all hover:scale-105 active:scale-95 text-dark-primary dark:text-light-primary hover:text-dark-primary/60 dark:hover:text-light-primary/60 active:text-dark-primary dark:active:text-light-primary/80"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <span className="sr-only">{ item.name }</span>
                                    <item.icon className="w-5 h-5" aria-hidden="true" />
                                </a>
                            ) ) }
                            {/* <Polling /> */ }
                        </div>
                    </div>
                    <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:col-span-2">
                        <div>
                            <div>
                                <h3 className="text-sm font-semibold tracking-wider uppercase text-dark-primary dark:text-light-primary transition-all">
                                    { i18n._( t`Partners` ) }
                                </h3>
                                <ul role="list" className="mt-4 space-y-1">
                                    { navigation.partner.map( ( item ) => (
                                        <li key={ item.name }>
                                            <a
                                                href={ item.href }
                                                className="text-sm transition-all hover:scale-105 active:scale-95 text-dark-primary dark:text-light-primary hover:text-dark-primary/60 dark:hover:text-light-primary/60 active:text-dark-primary dark:active:text-light-primary/80"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                { item.name }
                                            </a>
                                        </li>
                                    ) ) }
                                </ul>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold tracking-wider uppercase text-dark-primary dark:text-light-primary transition-all">
                                { i18n._( t`Developers` ) }
                            </h3>
                            <ul role="list" className="mt-4 space-y-1">
                                { navigation.developers.map( ( item ) => (
                                    <li key={ item.name }>
                                        <a
                                            href={ item.href }
                                            className="text-sm transition-all hover:scale-105 active:scale-95 text-dark-primary dark:text-light-primary hover:text-dark-primary/60 dark:hover:text-light-primary/60 active:text-dark-primary dark:active:text-light-primary/80"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            { item.name }
                                        </a>
                                    </li>
                                ) ) }
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold tracking-wider uppercase text-dark-primary dark:text-light-primary transition-all">
                                { i18n._( t`Business` ) }
                            </h3>
                            <ul role="list" className="mt-4 space-y-1">
                                { navigation.business.map( ( item ) => (
                                    <li key={ item.name }>
                                        <a
                                            href={ item.href }
                                            className="text-sm transition-all hover:scale-105 active:scale-95 text-dark-primary dark:text-light-primary hover:text-dark-primary/60 dark:hover:text-light-primary/60 active:text-dark-primary dark:active:text-light-primary/80"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            { item.name }
                                        </a>
                                    </li>
                                ) ) }
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
