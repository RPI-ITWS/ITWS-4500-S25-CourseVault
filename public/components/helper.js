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
                createHomepageButton({ id: 'findBackworkButton', text: 'Find Backwork' }),
                createHomepageButton({ id: 'uploadBackworkButton', text: 'Upload Backwork' })
            ),
            React.createElement(
                'div',
                { id: 'right-buttons' },
                createHomepageButton({ id: 'findProfessorButton', text: 'Find Professor' }),
                createHomepageButton({ id: 'rateProfessorButton', text: 'Rate A Professor' })
            )
        )
    );
}

function createHomepageButton({ id, text }) {
    return React.createElement(
        'button',
        { className: 'homepage-button', id: id },
        text
    );
}

const helperNode = document.getElementById('help-block');
const helper = ReactDOM.createRoot(helperNode);
helper.render(React.createElement(createHelper));
