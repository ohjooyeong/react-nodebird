import PropTypes from "prop-types";
import Head from "next/head";
import "antd/dist/antd.css";

// 전체 페이지의 공통적인 부분
const App = ({ Component }) => {
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <title>NodeBird</title>
            </Head>
            <Component />
        </>
    );
};

App.propTypes = {
    Component: PropTypes.elementType.isRequired,
};

export default App;
