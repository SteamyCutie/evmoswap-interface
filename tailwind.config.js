const defaultTheme = require( 'tailwindcss/defaultTheme' )
const plugin = require( 'tailwindcss/plugin' )

module.exports = {
    mode: 'jit',
    purge: ['./src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            linearBorderGradients: {
                directions: {
                    tr: 'to top right',
                    r: 'to right',
                },
                colors: {
                    'blue-red': ['#27B0E6', '#ff3838'],
                    'blue-pink': ['#27B0E6', '#FA52A0'],
                    'pink-red-light-brown': ['#FE5A75', '#FEC464'],
                    'blue-pink-special': ['#379FFF', '#FE3DD4'],
                    'red-red': ['ff3838', 'ff3838'],
                },
                background: {
                    'dark-1000': '#0D0415',
                    'dark-900': '#161522',
                    'dark-800': '#202231',
                    'dark-pink-red': '#4e3034',
                    'light-primary': '#FFFFFF',
                    'dark-primary': '#121212',
                },
                border: {
                    1: '1px',
                    2: '2px',
                    3: '3px',
                    4: '4px',
                },
            },
            colors: {
                'cyan-blue': '#0993EC',
                'low-emphesis': '#575757',
                'high-emphesis': '#E3E3E3',
                'black-russian': '#1A1D26',
                'carribean-green': '#00D395',
                'tahiti-gold': '#F5841F',
                purple: {
                    DEFAULT: '#a755dd'
                },
                blue: {
                    DEFAULT: '#2172e5',
                    'special': '#0085FF',
                    600: '#418AE8',
                },
                green: {
                    DEFAULT: '#7cff6b',
                    'special': '#26A17B',
                },
                red: {
                    DEFAULT: '#ff3838',
                    550: '#E12006',
                },
                yellow: {
                    DEFAULT: '#ffd166',
                },
                gold: {
                    DEFAULT: '#EC8F04'
                },
                pink: {
                    DEFAULT: '#f338c3',
                    red: '#FE5A75',
                    special: '#FE3DD4E1',
                    900: '#B102AA'
                },
                grey: {
                    DEFAULT: '#AFAFC5',
                    light: '#D1D1D1',
                    600: '#AEAEAE',
                    400: '#2B2B2B'
                },
                light: {
                    DEFAULT: '#FFFFFF',
                    primary: '#FFFFFF',
                    secondary: '#F2F7FF',
                    text: '#595959',
                    border: '#A1A1A1',
                    stroke: '#EAEAFF',
                    blue: '#0085FF',
                    yellow: '#FFD166'

                },
                dark: {
                    DEFAULT: '#121212',
                    primary: '#121212',
                    secondary: '#1A1A1A',
                    text: '#868686',
                    border: '#2B2B2B',
                    stroke: '#222222',
                    blue: '#0085FF',
                    pink: '#221825',
                    gray: '#20222F',
                    1000: '#0D0415',
                    900: '#161522',
                    850: '#1d1e2c',
                    800: '#202231',
                    700: '#2E3348',
                    650: '#8F8D94',
                    600: '#1C2D49',
                    500: '#223D5E',
                    400: '#171522',
                }
            },
            lineHeight: {
                '48px': '48px',
            },
            fontFamily: {
                sans: ['Montserrat', 'DM Sans', ...defaultTheme.fontFamily.sans],
                inter: ['Inter', 'sans-serif']
            },
            fontSize: {
                sm: [
                    '12px',
                    {
                        letterSpacing: '0.5px',
                        lineHeight: '16.63px',
                        fontWeight: 400,
                    },
                ],
                base: [
                    '14px',
                    {
                        letterSpacing: '0',
                        lineHeight: '17px',
                        fontWeight: 400,
                    },
                ],
                hero: [
                    '48px',
                    {
                        letterSpacing: '-0.02em;',
                        lineHeight: '96px',
                        fontWeight: 700,
                    },
                ],
                '3.5xl': [
                    '32px',
                    {
                        lineHeight: '39px',
                        fontWeight: 700,
                        align: 'center'
                    },
                ],
                slg: [
                    '16px',
                    {
                        letterSpacing: '0',
                        lineHeight: '20.4px',
                        fontWeight: 400,
                    },
                ],
            },
            borderRadius: {
                px: '1px',
                'xl': '10px',
                '1.5xl': '14px',
                '2.5xl': '20px',
            },
            boxShadow: {
                swap: '0px 50px 250px -47px rgba(39, 176, 230, 0.29)',
                liquidity: '0px 50px 250px -47px rgba(123, 97, 255, 0.23)',
                'pink-glow': '0px 57px 90px -47px rgba(250, 82, 160, 0.15)',
                'blue-glow': '0px 57px 90px -47px rgba(39, 176, 230, 0.17)',
                'pink-glow-hovered': '0px 57px 90px -47px rgba(250, 82, 160, 0.30)',
                'blue-glow-hovered': '0px 57px 90px -47px rgba(39, 176, 230, 0.34)',
            },
            ringWidth: {
                DEFAULT: '1px',
            },
            padding: {
                px: '1px',
                '3px': '3px',
            },
            minHeight: {
                empty: '128px',
            },
            minHeight: {
                5: '1.25rem',
            },
            minWidth: {
                5: '1.25rem',
            },
            dropShadow: {
                currencyLogo: '0px 3px 6px rgba(15, 15, 15, 0.25)',
            },
            screens: {
                '3xl': '1600px',
            },
            animation: {
                ellipsis: 'ellipsis 1.25s infinite',
                'spin-slow': 'spin 2s linear infinite',
                fade: 'opacity 150ms linear',
            },
            keyframes: {
                ellipsis: {
                    '0%': { content: '"."' },
                    '33%': { content: '".."' },
                    '66%': { content: '"..."' },
                },
                opacity: {
                    '0%': { opacity: 0 },
                    '100%': { opacity: 100 },
                },
            },
        },
    },
    plugins: [
        require( 'tailwindcss-border-gradient-radius' ),
        plugin( function ( { addUtilities } ) {
            addUtilities( {
                '.grey-linear-gradient-dark': {
                    background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.2) 51.04%, rgba(255, 255, 255, 0.1) 100%)',
                },
                '.grey-linear-gradient': {
                    background: 'linear-gradient(90deg, rgba(18, 18, 18, 0.05) 0%, rgba(18, 18, 18, 0.15) 51.04%, rgba(18, 18, 18, 0.05) 100%);'
                }
            } )
        } ),
    ],
}
