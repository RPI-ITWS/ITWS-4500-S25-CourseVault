'use strict';

function createHeader() {
    return React.createElement(
        'h1',
        { id: "header-title" },
        `COURSE VAULT`
    );
}

const headerNode = document.getElementById('headerDiv');
const header = ReactDOM.createRoot(headerNode);
header.render(React.createElement(createHeader));