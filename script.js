document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn.querySelector('.icon');
    const body = document.body;

    themeBtn.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            themeIcon.textContent = '☀️';
        } else {
            themeIcon.textContent = '🌙';
        }
    });

    // Mode Toggle Logic (Student / Tutor)
    const studentBtn = document.getElementById('student-mode-btn');
    const tutorBtn = document.getElementById('tutor-mode-btn');
    
    // In a real app, this would trigger a re-render or navigation. 
    // For now, it visually toggles the active state.
    studentBtn.addEventListener('click', () => {
        studentBtn.classList.add('active');
        tutorBtn.classList.remove('active');
        // Visual indicator that we are in student mode
        document.querySelector('.welcome-banner').classList.add('purple');
        document.querySelector('.welcome-banner').classList.remove('green');
        document.querySelector('.welcome-banner .greeting').textContent = "Hello, Felix!";
    });

    tutorBtn.addEventListener('click', () => {
        tutorBtn.classList.add('active');
        studentBtn.classList.remove('active');
        // Visual indicator that we are in tutor mode (Tutor uses green accent)
        document.querySelector('.welcome-banner').classList.add('green');
        document.querySelector('.welcome-banner').classList.remove('purple');
        document.querySelector('.welcome-banner .greeting').textContent = "Tutor Mode";
    });
});
