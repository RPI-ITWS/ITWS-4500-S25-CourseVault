'use strict';

function createHeader() {
    return React.createElement(
        'h1',
        null,
        `COURSE VAULT`
    );
}

const headerNode = document.getElementById('headerDiv');
const header = ReactDOM.createRoot(headerNode);
header.render(React.createElement(createHeader));