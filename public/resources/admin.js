document.addEventListener('DOMContentLoaded', () => {
    const navButtons = document.querySelectorAll('.nav-button');
    const forms = document.querySelectorAll('.admin-form');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.classList.contains('active')) {
                navButtons.forEach(btn => btn.classList.remove('active'));
                forms.forEach(form => form.classList.remove('active'));
                return;
            }

            navButtons.forEach(btn => btn.classList.remove('active'));
            forms.forEach(form => form.classList.remove('active'));

            button.classList.add('active');
            
            const formId = button.id.replace('Btn', 'Form');
            const correspondingForm = document.getElementById(formId);
            correspondingForm.classList.add('active');
        });
    });
});