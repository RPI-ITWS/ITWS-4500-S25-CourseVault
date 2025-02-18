'use strict';

function Navbar() {
    const [activeTab, setActiveTab] = React.useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
    const nonAuthPaths = ['', '/', '/login', '/login/', '/signup', '/signup/']
    const [isLoggedIn, setIsLoggedIn] = 
    React.useState(nonAuthPaths.includes(window.location.pathname) ? false : true);
    const [hoveredElement, setHoveredElement] = React.useState(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            const moreButton = document.getElementById('moreButton');
            const dropdownMenu = document.getElementById('dropdownMenu');
            
            if (moreButton && dropdownMenu && 
                !moreButton.contains(e.target) && 
                !dropdownMenu.contains(e.target)) {
                setIsDropdownVisible(false);
                setActiveTab(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    function NavButton({ id, text, onClick }) {
        return React.createElement('div',
            {
                id: id,
                className: `nav-tab ${activeTab === id ? 'active' : ''}`,
                onClick: (e) => {
                    setActiveTab(prev => prev === id ? null : id);
                    if (onClick) onClick(e);
                },
                onMouseEnter: () => setHoveredElement(id),
                onMouseLeave: () => setHoveredElement(null),
                style: {
                    backgroundColor: (activeTab === id || hoveredElement === id) ? '#ac9f90' : '#e6d5c0',
                    transition: 'background-color 0.2s ease'
                }
            },
            React.createElement('h3', null, text)
        );
    }

    function DropdownItem({ id, text, onClick }) {
        return React.createElement('div',
            {
                className: 'dropdown-item',
                onClick: onClick || null,
                onMouseEnter: () => setHoveredElement(id),
                onMouseLeave: () => setHoveredElement(null),
                style: {
                    backgroundColor: hoveredElement === id ? '#ac9f90' : '#e6d5c0',
                    transition: 'background-color 0.2s ease'
                }
            },
            React.createElement('h3', null, text)
        );
    }

    const handleMoreClick = (e) => {
        e.stopPropagation();
        setIsDropdownVisible(prev => !prev);
        setActiveTab(prev => prev === 'moreButton' ? null : 'moreButton');
    };

    const MoreButton = () => {
        return React.createElement('div',
            {
                id: 'moreButton',
                className: `nav-tab ${activeTab === 'moreButton' ? 'active' : ''}`,
                onClick: handleMoreClick,
                onMouseEnter: () => setHoveredElement('moreButton'),
                onMouseLeave: () => setHoveredElement(null),
                style: {
                    backgroundColor: (activeTab === 'moreButton' || hoveredElement === 'moreButton') ? '#ac9f90' : '#e6d5c0',
                    transition: 'background-color 0.2s ease'
                }
            },
            React.createElement('img', {
                src: '/public/resources/photos/menu.png',
                alt: 'More',
                style: {
                    width: '12%'
                }
            }),
            React.createElement('div',
                {
                    id: 'dropdownMenu',
                    style: {
                        display: isDropdownVisible ? 'flex' : 'none'
                    }
                },
                React.createElement(DropdownItem, { 
                    id: 'profile',
                    text: 'Profile' 
                }),
                React.createElement(DropdownItem, {
                    id: 'login',
                    text: 'Login',
                    onClick: () => window.location.href = `${window.origin}/login`
                }),
                React.createElement(DropdownItem, {
                    id: 'signup',
                    text: 'Signup',
                    onClick: () => window.location.href = `${window.origin}/signup`
                }),
                React.createElement(DropdownItem, { 
                    id: 'settings',
                    text: 'Settings' 
                })
            )
        );
    };

    return React.createElement(React.Fragment, null,
        React.createElement(NavButton, { 
            id: 'homeButton', 
            text: 'Home', 
            onClick: () => window.location.href = isLoggedIn ? 
            `${window.origin}/user` : 
            `${window.origin}/`
        }),
        React.createElement(NavButton, { 
            id: 'backworkButton',
            text: isLoggedIn ? 'Backwork' : 'Login', 
            onClick: () => window.location.href = isLoggedIn ? 
                `${window.origin}/backwork` : 
                `${window.origin}/login`
        }),
        React.createElement(NavButton, { 
            id: 'profButton', 
            text: isLoggedIn ? 'Professors' : 'Sign Up',
            onClick: () => window.location.href = isLoggedIn ? 
                `${window.origin}/professors` : 
                `${window.origin}/signup`
        }),
        isLoggedIn
        ? [
            React.createElement(NavButton, { 
                id: 'classesButton', 
                text: 'Class Schedular',
                onClick: () => window.location.href = `${window.origin}/schedule`
            }),
            React.createElement(MoreButton)
        ]
        : []
    );
}

const navbarNode = document.getElementById('navbar');
const root = ReactDOM.createRoot(navbarNode);
root.render(React.createElement(Navbar));