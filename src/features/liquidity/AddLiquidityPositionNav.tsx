import { ChevronRightIcon } from "@heroicons/react/solid"
import { i18n } from "@lingui/core"
import { t } from "@lingui/macro"
import Alert, { AlertProps } from "app/components/Alert"
import Button from "app/components/Button"
import { InfoSquareIcon } from "app/components/Icon"
import NavLink from "app/components/NavLink"
import { RowBetween } from "app/components/Row"
import { MouseoverContent } from "app/components/Tooltip"

const AddLiquidityPositionNav = ( { link, alert }: { link: string, alert: AlertProps } ) => {

    return (
        <RowBetween className="w-full items-center mb-5 flex-wrap text-dark dark:text-light hover:text-dark-primary dark:hover:text-light-primary">
            <NavLink href={ link } activeClassName="text-dark dark:text-light">
                <a className="flex items-center space-x-2 text-base text-center transition-all cursor-pointer">
                    <span>{ i18n._( t`View Liquidity Positions` ) }</span>
                    <ChevronRightIcon width={ 18 } height={ 18 } />
                </a>
            </NavLink>
            <MouseoverContent content={
                <div className='w-full flex mt-4'>
                    <Alert
                        type="information"
                        dismissable={ false }
                        { ...alert }
                    />
                </div>
            }>
                <Button className='!p-0'>
                    <InfoSquareIcon width={ 18 } height={ 18 } />
                </Button>
            </MouseoverContent>
        </RowBetween>
    )
}
export default AddLiquidityPositionNav