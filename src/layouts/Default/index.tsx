import Footer from '../../components/Footer'
import Header from '../../components/Header'
import Main from '../../components/Main'
import Popups from '../../components/Popups'

const Layout = ( { children } ) => {
    return (
        <div
            className="main-wrapper z-0 flex flex-col items-center w-full min-h-screen bg-light-primary dark:bg-dark-primary transition-all"
        >
            <Header />
            <Main>{ children }</Main>
            <Popups />
            <Footer />
        </div>
    )
}

export default Layout
