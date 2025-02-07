'use strict';

function createNavbar() {
    return React.createElement(React.Fragment, null,
        React.createElement(createNavButton, { id: 'homeButton', text: 'Home' }),
        React.createElement(createNavButton, { id: 'backworkButton', text: 'Backwork' }),
        React.createElement(createNavButton, { id: 'profButton', text: 'Professors' }),
        React.createElement(createNavButton, { id: 'classesButton', text: 'Classes' }),
        React.createElement('div', { id: 'moreButton', className: 'nav-tab' },
            React.createElement('h3', null, '...'),
            React.createElement('div', { id: 'dropdownMenu' },
                React.createElement(createDropdownItem, { text: 'Profile' }),
                React.createElement(createDropdownItem, {
                    text: 'Login',
                    onClick: () => window.location.href = './index.html'
                }),
                React.createElement(createDropdownItem, { text: 'Signup' }),
                React.createElement(createDropdownItem, { text: 'Settings' })
            )
        )
    );
}

function createNavButton({ id, text }) {
    return React.createElement('div', { id: id, className: 'nav-tab' },
        React.createElement('h3', null, text)
    );
}

function createDropdownItem({ text, onClick }) {
    return React.createElement('div', {
        className: 'dropdown-item',
        onClick: onClick || null
    },
    React.createElement('h3', null, text));
}

const navbarNode = document.getElementById('navbar');
const navbar = ReactDOM.createRoot(navbarNode);
navbar.render(React.createElement(createNavbar));