'use strict';

function Navbar() {
   const [activeTab, setActiveTab] = React.useState(null);
   const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);

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
               style: {
                   backgroundColor: activeTab === id ? '#ff8c00' : '#e6d5c0'
               }
           },
           React.createElement('h3', null, text)
       );
   }

   function DropdownItem({ text, onClick }) {
       return React.createElement('div',
           {
               className: 'dropdown-item',
               onClick: onClick || null
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
           onClick: () => window.location.href = '/public/index.html' 
       }),
       React.createElement(NavButton, { 
           id: 'backworkButton', 
           text: 'Backwork',
           onClick: () => window.location.href = '/public/backwork/index.html'  
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
               style: {
                   backgroundColor: activeTab === 'moreButton' ? '#ac9f90' : '#e6d5c0'
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
                   text: 'Profile' 
               }),
               React.createElement(DropdownItem, {
                   text: 'Login',
                   onClick: () => window.location.href = '/public/login/index.html'
               }),
               React.createElement(DropdownItem, { 
                   text: 'Signup',
                   onClick: () => window.location.href = '/public/signup/index.html' 
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