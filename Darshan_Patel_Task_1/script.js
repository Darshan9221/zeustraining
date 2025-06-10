document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        let errors = [];
        const name = form.querySelector('input[type="text"]').value.trim();
        const comments = form.querySelector('textarea').value.trim();
        const genderChecked = form.querySelector('input[name="gender"]:checked');

        if (!name) {
            errors.push('Name is required.');
        }
        if (!comments) {
            errors.push('Comments are required.');
        }
        if (!genderChecked) {
            errors.push('Please select your gender.');
        }

        if (errors.length > 0) {
            alert(errors.join('\n'));
            event.preventDefault();
        }
    });
});