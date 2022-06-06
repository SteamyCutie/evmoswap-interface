import Button from 'app/components/Button'
import Link from 'next/link'

const GEmoFlow = () => {
    const styleCell = 'p-2 md:p-4 rounded-xl bg-light dark:bg-dark items-center text-center grid align-middle text-sm md:text-sm'
    const styleCard = `${styleCell} grid gap-1 items-center justify-center justify-items-center w-full text-center text-sm md:text-base`

    return (
        <div className="grid items-start justify-center grid-cols-1 gap-2 p-4 bg-cover md:p-6 bg-light dark:bg-dark/60 rounded-2xl">
            <div className="m-4 text-2xl font-extrabold text-center uppercase">Gem EMO Breakdown</div>
            <div className="grid grid-cols-12 gap-1 md:gap-2">
                <div className="col-span-2"></div>
                <div className={ `${styleCell} col-span-3` }>
                    <p className="font-extrabold">Converting</p>
                </div>
                <div className={ `${styleCell} col-span-4` }>
                    <p className="font-extrabold">Staking / Committing</p>
                </div>
                <div className={ `${styleCell} col-span-3` }>
                    <p className="font-extrabold">Returning</p>
                </div>

                <div className={ `${styleCell} col-span-2` }>
                    <p>Fee</p>
                </div>
                <div className={ `${styleCell} col-span-3 gap-1` }>
                    <p>28% Burn Fee</p>
                    <p>2% Reflect Fee</p>
                </div>
                <div className={ `${styleCell} col-span-4` }>
                    <p>2% Reflect Fee (Both in and out)</p>
                </div>
                <div className={ `${styleCell} col-span-3` }>
                    <p>2% Reflect Fee</p>
                </div>
                <div className={ `${styleCell} col-span-2` }>
                    <p>Value</p>
                </div>
                <div className={ `${styleCell} col-span-3` }>
                    <p>.7 GEMO per EMO</p>
                </div>
                <div className={ `${styleCell} col-span-4` }>
                    <p>1 GEMO calculated as 1.389 EMO</p>
                </div>
                <div className={ `${styleCell} col-span-3` }>
                    <p>.98 EMO per GEMO</p>
                </div>
            </div>
            <div className="m-4 text-2xl font-extrabold text-center uppercase mt-8">KEY DISCLAIMERS</div>
            <div className={ styleCard }>
                The 2% reflect fee applies to all $GEMO transactions, including transfer, staking, unstaking, and participation
                in IEOs.
            </div>
            <div className={ styleCard }>You do not accumulate reflect fees when your GEMO is staked in a pool.</div>
            <div className="flex justify-center mt-2">
                <Link href="/" passHref>
                    <a target="_blank" rel="norefferer noopenner" className="w-full md:w-[300px] justify-items-center">
                        <Button color="blue" variant="filled">
                            Learn More
                        </Button>
                    </a>
                </Link>
            </div>
        </div>
    )
}

export default GEmoFlow
