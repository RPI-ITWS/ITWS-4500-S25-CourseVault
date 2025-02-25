'use strict';

function createHelper() {
    return React.createElement(
        React.Fragment,
        null,
        React.createElement('h2', { id: 'sub-title' }, 'How Can We Help Today?'),
        React.createElement(
            'div',
            { id: 'button-container' },
            React.createElement(
                'div',
                { id: 'left-buttons' },
                createHomepageButton({ 
                    id: 'findBackworkButton', 
                    text: 'Find Backwork',
                    onClick: () => window.location.href = `${window.origin}/backwork`
                }),
                createHomepageButton({ 
                    id: 'uploadBackworkButton', 
                    text: 'Upload Backwork',
                    onClick: () => window.location.href = `${window.origin}/UploadWork`
                })
            ),
            React.createElement(
                'div',
                { id: 'right-buttons' },
                createHomepageButton({ 
                    id: 'findProfessorButton', 
                    text: 'Rate A Course',
                    onClick: () => window.location.href = `${window.origin}/professors` 
                }),
                createHomepageButton({ 
                    id: 'rateProfessorButton', 
                    text: 'Create A Schedule',
                    onClick: () => window.location.href = `${window.origin}/schedule`
                })
            )
        )
    );
}

function createHomepageButton({ id, text, onClick }) {
    return React.createElement(
        'button',
        { 
            className: 'homepage-button', 
            id: id,
            onClick: onClick
        },
        text
    );
}

const helperNode = document.getElementById('help-block');
const helper = ReactDOM.createRoot(helperNode);
helper.render(React.createElement(createHelper));
