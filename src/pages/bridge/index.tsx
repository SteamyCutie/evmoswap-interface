import Head from 'next/head'
import Container from 'app/components/Container'
import { i18n } from '@lingui/core'
import { t } from '@lingui/macro'
import Button from 'app/components/Button'
import Alert from 'app/components/Alert'

const BRIDGE_DATA = [
    {
        name: 'Nomad',
        description: 'Nomad is a new design for radically cheaper cross-chain communication without header verification.',
        link: 'https://app.nomad.xyz/',
        active: true,
    },
    {
        name: 'Connext',
        description: 'Connext powers fast, secure bridging between blockchains and rollups for composable, trust minimized value.',
        link: 'https://bridge.connext.network/from-ethereum-to-evmos',
        active: true,
    },
    {
        name: 'Celer Bridge',
        description: 'cBridge introduces the best-in-class cross-chain token bridging experience with deep liquidity for users.',
        link: 'https://cbridge.celer.network/#/transfer',
        active: true,
    },
    {
        name: 'Multichain',
        description:
            'Multichain is the ultimate Router for web3. It is an infrastructure developed for arbitrary cross-chain interactions.',
        link: 'https://app.multichain.org/#/router',
        active: true,
    },
]

export default function Bridge () {
    return (
        <Container className="py-4 md:py-8 lg:py-12" maxWidth="6xl">
            <Head>
                <title key="title">Bridge | EvmoSwap</title>
                <meta key="description" name="description" content="Bridge EvmoSwap" />
            </Head>
            <div className="w-full m-auto mt-8 ">
                <div className="w-full">
                    <div className="text-3xl text-center font-bold scale-125">Bridge your assets</div>
                </div>
                <div className='p-4 my-2'>
                    <Alert message={
                        <>
                            Tip:{ ' ' }
                            <span className='font-bold'>
                                { i18n._(
                                    t`Bridging assets might take up to 30 minutes or more depending on chain of departure, network congestion, and other factors. For advanced support regarding a bridge transaction please refer to your bridge of choice.`
                                ) }
                            </span>
                        </>
                    }
                        type="warning"
                        dismissable={ false }
                    />
                </div>
                <div className="grid w-full gap-4 p-4">
                    { BRIDGE_DATA.map( ( item, idx ) => (
                        <div
                            key={ idx }
                            className="flex items-center w-full bg-light-secondary dark:bg-dark-secondary px-12 py-8 rounded-2xl space-x-8"
                        >
                            <div className="grid w-4/5 space-y-2">
                                <div className="text-2xl font-bold">{ item.name }</div>
                                <div className="text-lg">{ item.description }</div>
                            </div>
                            <div className="grid w-1/5">
                                <a href={ item.active && item.link } target="_blank" rel="noreferrer" aria-disabled={ !item.active }>
                                    <Button color={ item.active ? "gradient" : "gray" } className="w-full" variant="filled" disabled={ !item.active }>
                                        { i18n._( t`Bridge` ) }
                                    </Button>
                                </a>
                            </div>
                        </div>
                    ) ) }
                </div>
            </div>
        </Container>
    )
}
