'use strict';
let photo_url = '';

  let url2 = /*"https://course-vault.eastus.cloudapp.azure.com/node"*/"http://localhost:3000";
  photo_url = /*"/node/resources/photos/menu.png"*/"./resources/photos/menu.png";


function Navbar() {
    const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
    const [hoveredElement, setHoveredElement] = React.useState(null);

    React.useEffect(() => {
        checkLoginStatus();
            
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

    // New function to check login status without redirecting
    function checkLoginStatus() {
        return fetch(`${url2}/status`)
            .then(response => response.json())
            .then(data => {
                console.log("Status check:", data.status);
                setIsLoggedIn(data.status === 'admin' || data.status === 'user');
                return data.status;
            })
            .catch(error => {
                console.error('Error checking user status:', error);
                setIsLoggedIn(false);
                return 'error';
            });
    }

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

    // Keep the original determineStatus for navigation purposes
    function determineStatus() {
        return fetch(`${url2}/status`)
            .then(response => response.json())
            .then(data => {
                console.log("Status check:", data.status);
                if (data.status === 'unknown') {
                    window.location.href = `/index.html`;
                } else if (data.status === 'admin') {
                    if (window.location.href === `/admin/index.html`){
                        return;
                    }else{
                        window.location.href = `/admin/index.html`;
                    }
                } else if (data.status === 'user') {
                    window.location.href = `/user/index.html`;
                }
                return;
            })
            .catch(error => {
                console.error('Error checking user status:', error);
                window.location.href = `/index.html`;
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
        fetch(`${url2}/logout`, {
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
            setIsLoggedIn(false);
            window.location.href = `/index.html`
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
                src: `${photo_url}`,
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
                        onClick: () => window.location.href = `/profile/index.html`
                    }),
                    React.createElement(DropdownItem, { 
                        key: 'settings',
                        id: 'settings',
                        text: 'Settings',
                        onClick: () => window.location.href = `/index.html`
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
                        onClick: () => window.location.href = `/login//index.html`
                    }),
                    React.createElement(DropdownItem, {
                        key: 'signup',
                        id: 'signup',
                        text: 'Signup',
                        onClick: () => window.location.href = `/signup/index.html`
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
                `/backwork/index.html` : 
                `/login/index.html`
        }),
        React.createElement(NavButton, { 
            id: 'profButton', 
            text: isLoggedIn ? 'Courses' : 'Sign Up',
            onClick: () => window.location.href = isLoggedIn ? 
                `/courses/index.html` : 
                `/signup/index.html`
        }),
        isLoggedIn
        ? [
            React.createElement(NavButton, { 
                key: 'classesButton',
                id: 'classesButton', 
                text: 'Schedule',
                onClick: () => window.location.href = `/schedule/index.html`
            }),
            React.createElement(MoreButton, { key: 'moreButton' })
        ]
        : []
    );
}

const navbarNode = document.getElementById('navbar');
const root = ReactDOM.createRoot(navbarNode);
root.render(React.createElement(Navbar));