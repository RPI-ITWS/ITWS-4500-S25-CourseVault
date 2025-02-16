'use strict';

function Navbar() {
    const [activeTab, setActiveTab] = React.useState(null);
    const [isDropdownVisible, setIsDropdownVisible] = React.useState(false);

    React.useEffect(() => {
        const handleClickOutside = (e) => {
            const moreButton = document.getElementById('moreButton');
            const dropdownMenu = document.getElementById('dropdownMenu');

            if (
                moreButton &&
                dropdownMenu &&
                !moreButton.contains(e.target) &&
                !dropdownMenu.contains(e.target)
            ) {
                setIsDropdownVisible(false);
                setActiveTab(null);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const NavButton = ({ id, text, onClick }) => {
        const handleClick = (e) => {
            setActiveTab((prev) => (prev === id ? null : id));
            if (onClick) onClick(e);
        };

        return (
            <div
                id={id}
                className={`nav-tab ${activeTab === id ? 'active' : ''}`}
                onClick={handleClick}
                style={{
                    backgroundColor: activeTab === id ? '#ff8c00' : '#e6d5c0',
                }}
            >
                <h3>{text}</h3>
            </div>
        );
    };

    const DropdownItem = ({ text, onClick }) => (
        <div className="dropdown-item" onClick={onClick || null}>
            <h3>{text}</h3>
        </div>
    );

    const handleMoreClick = (e) => {
        e.stopPropagation();
        setIsDropdownVisible((prev) => !prev);
        setActiveTab((prev) => (prev === 'moreButton' ? null : 'moreButton'));
    };

    return (
        <>
            <NavButton
                id="homeButton"
                text="Home"
                onClick={() => (window.location.href = '/public/index.html')}
            />
            <NavButton
                id="backworkButton"
                text="Backwork"
                onClick={() => (window.location.href = '/public/backwork/index.html')}
            />
            <NavButton id="profButton" text="Professors" />
            <NavButton id="classesButton" text="Classes" />
            <div
                id="moreButton"
                className={`nav-tab ${activeTab === 'moreButton' ? 'active' : ''}`}
                onClick={handleMoreClick}
                style={{
                    backgroundColor: activeTab === 'moreButton' ? '#ac9f90' : '#e6d5c0',
                }}
            >
                <img
                    src="/public/resources/photos/menu.png"
                    alt="More"
                    style={{ width: '12%' }}
                />
                <div
                    id="dropdownMenu"
                    style={{ display: isDropdownVisible ? 'flex' : 'none' }}
                >
                    <DropdownItem text="Profile" />
                    <DropdownItem
                        text="Login"
                        onClick={() =>
                            (window.location.href = '/public/login/index.html')
                        }
                    />
                    <DropdownItem
                        text="Signup"
                        onClick={() =>
                            (window.location.href = '/public/signup/index.html')
                        }
                    />
                    <DropdownItem text="Settings" />
                </div>
            </div>
        </>
    );
}

const navbarNode = document.getElementById('navbar');
const root = ReactDOM.createRoot(navbarNode);
root.render(<Navbar />);