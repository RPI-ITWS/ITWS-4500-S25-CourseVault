'use strict';

function Navbar() {
   const [activeTab, setActiveTab] = React.useState(null);
   const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);
   const [hoveredTab, setHoveredTab] = React.useState(null);

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

   function getBackgroundColor(id) {
       if (activeTab === id) return '#ac9f90';
       if (hoveredTab === id) return '#ac9f90';
       return '#e6d5c0';
   }

   function NavButton({ id, text, onClick }) {
       return React.createElement('div',
           {
               id: id,
               className: `nav-tab ${activeTab === id ? 'active' : ''}`,
               onClick: (e) => {
                   setActiveTab(prev => prev === id ? null : id);
                   if (onClick) onClick(e);
               },
               onMouseEnter: () => setHoveredTab(id),
               onMouseLeave: () => setHoveredTab(null),
               style: {
                   backgroundColor: getBackgroundColor(id),
                   transition: 'background-color 0.2s ease'
               }
           },
           React.createElement('h3', null, text)
       );
   }

   function DropdownItem({ text, onClick }) {
       const [isHovered, setIsHovered] = React.useState(false);
       return React.createElement('div',
           {
               className: 'dropdown-item',
               onClick: onClick || null,
               onMouseEnter: () => setIsHovered(true),
               onMouseLeave: () => setIsHovered(false),
               style: {
                   backgroundColor: isHovered ? '#ac9f90' : '#e6d5c0',
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

   return React.createElement(React.Fragment, null,
       React.createElement(NavButton, { 
           id: 'homeButton', 
           text: 'Home', 
           onClick: () => window.location.href = '/index.html' 
       }),
       React.createElement(NavButton, { 
           id: 'backworkButton', 
           text: 'Backwork',
           onClick: () => window.location.href = '/backwork/index.html'  
       }),
       React.createElement(NavButton, { 
           id: 'profButton', 
           text: 'Professors' 
       }),
       React.createElement(NavButton, { 
           id: 'classesButton', 
           text: 'Classes' 
       }),
       React.createElement('div',
           {
               id: 'moreButton',
               className: `nav-tab ${activeTab === 'moreButton' ? 'active' : ''}`,
               onClick: handleMoreClick,
               onMouseEnter: () => setHoveredTab('moreButton'),
               onMouseLeave: () => setHoveredTab(null),
               style: {
                   backgroundColor: getBackgroundColor('moreButton'),
                   transition: 'background-color 0.2s ease'
               }
           },
           React.createElement('img', {
               src: '/resources/photos/menu.png',
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
                   text: 'Profile' 
               }),
               React.createElement(DropdownItem, {
                   text: 'Login',
                   onClick: () => window.location.href = '/login/index.html'
               }),
               React.createElement(DropdownItem, { 
                   text: 'Signup',
                   onClick: () => window.location.href = '/signup/index.html' 
               }),
               React.createElement(DropdownItem, { 
                   text: 'Settings' 
               })
           )
       )
   );
}

const navbarNode = document.getElementById('navbar');
const root = ReactDOM.createRoot(navbarNode);
root.render(React.createElement(Navbar));