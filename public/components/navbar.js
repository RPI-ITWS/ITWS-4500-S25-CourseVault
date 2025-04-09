'use strict';

function Navbar() {
    const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
    const nonAuthPaths = ['', '/', '/login', '/login/', '/signup', '/signup/']
    const [isLoggedIn, setIsLoggedIn] = React.useState(nonAuthPaths.includes(window.location.pathname) ? false : true);
    const [hoveredElement, setHoveredElement] = React.useState(null);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            const moreButton = document.getElementById('moreButton');
            const dropdownMenu = document.getElementById('dropdownMenu');
            
            if (moreButton && dropdownMenu && 
                !moreButton.contains(e.target) && 
                !dropdownMenu.contains(e.target)) {
                setIsDropdownVisible(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    function NavButton({ id, text, onClick }) {
        return React.createElement('div',
            {
                id: id,
                className: 'nav-tab',
                onClick: onClick,
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

    function determineStatus() {
        return fetch(`${window.location.origin}/node/status`)
            .then(response => response.json())
            .then(data => {
                console.log("Status check:", data.status);
                if (data.status === 'unknown') {
                    window.location.href = `${window.location.origin}/node/`;
                } else if (data.status === 'admin') {
                    if (window.location.href === `${window.location.origin}/node/admin/`){
                        return;
                    }else{
                        window.location.href = `${window.location.origin}/node/admin/`;
                    }
                } else if (data.status === 'user') {
                    window.location.href = `${window.location.origin}/node/user/`;
                }
                return;
            })
            .catch(error => {
                console.error('Error checking user status:', error);
                window.location.href = `${window.location.origin}/node/`;
                return 'error';
            });
    }

    const handleHomeClick = () => {
        determineStatus();
    };

    const handleMoreClick = (e) => {
        e.stopPropagation();
        setIsDropdownVisible(prev => !prev);
    };

    const handleLogout = () => {
        // setIsLoggedIn(false);
        fetch(`${window.origin}/node/logout`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'}
          })
        .then(response => {
            if (!response.ok) {
              throw new Error(`Error: HTTP request of status ${response.status}`);
            }
            return response.text()
          })
          .then(data => {
            // since response.ok is true, logout was successful, dont need to check data (can use for an alert or something to tell user tho)
            alert(data)
            window.location.href = `${window.origin}/`
          })
          .catch(error => {
            console.error('There was a problem with the Logout fetch operation:', error)
          })
    };

    const MoreButton = () => {
        return React.createElement('div',
            {
                id: 'moreButton',
                className: `nav-tab ${isDropdownVisible ? 'active' : ''}`,
                onClick: handleMoreClick,
                onMouseEnter: () => setHoveredElement('moreButton'),
                onMouseLeave: () => setHoveredElement(null),
                style: {
                    backgroundColor: (isDropdownVisible || hoveredElement === 'moreButton') ? '#ac9f90' : '#e6d5c0',
                    transition: 'background-color 0.2s ease'
                }
            },
            React.createElement('img', {
                src: '/resources/photos/menu.png',
                alt: 'More'
            }),
            React.createElement('div',
                {
                    id: 'dropdownMenu',
                    style: {
                        display: isDropdownVisible ? 'flex' : 'none'
                    }
                },
                isLoggedIn
                ? [
                    React.createElement(DropdownItem, { 
                        key: 'profile',
                        id: 'profile',
                        text: 'Profile',
                        onClick: () => window.location.href = `${window.origin}/node/profile`
                    }),
                    React.createElement(DropdownItem, { 
                        key: 'settings',
                        id: 'settings',
                        text: 'Settings',
                        onClick: () => window.location.href = `${window.origin}/node`
                    }),
                    React.createElement(DropdownItem, { 
                        key: 'logout',
                        id: 'logout',
                        text: 'Logout',
                        onClick: handleLogout
                    })
                ]
                : [
                    React.createElement(DropdownItem, {
                        key: 'login',
                        id: 'login',
                        text: 'Login',
                        onClick: () => window.location.href = `${window.origin}/node/login`
                    }),
                    React.createElement(DropdownItem, {
                        key: 'signup',
                        id: 'signup',
                        text: 'Signup',
                        onClick: () => window.location.href = `${window.origin}/node/signup`
                    }),
                ]
            )
        );
    };

    return React.createElement(React.Fragment, null,
        React.createElement(NavButton, { 
            id: 'homeButton', 
            text: 'Home', 
            onClick: handleHomeClick
        }),
        React.createElement(NavButton, { 
            id: 'backworkButton',
            text: isLoggedIn ? 'Backwork' : 'Login', 
            onClick: () => window.location.href = isLoggedIn ? 
                `${window.origin}/node/backwork` : 
                `${window.origin}/node/login`
        }),
        React.createElement(NavButton, { 
            id: 'profButton', 
            text: isLoggedIn ? 'Courses' : 'Sign Up',
            onClick: () => window.location.href = isLoggedIn ? 
                `${window.origin}/node/courses` : 
                `${window.origin}/node/signup`
        }),
        isLoggedIn
        ? [
            React.createElement(NavButton, { 
                key: 'classesButton',
                id: 'classesButton', 
                text: 'Schedule',
                onClick: () => window.location.href = `${window.origin}/node/schedule`
            }),
            React.createElement(MoreButton, { key: 'moreButton' })
        ]
        : []
    );
}

const navbarNode = document.getElementById('navbar');
const root = ReactDOM.createRoot(navbarNode);
root.render(React.createElement(Navbar));