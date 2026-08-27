// Ceylonica Keycloak Theme Interactivity
function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    const showIcon = btn.querySelector('.eye-show');
    const hideIcon = btn.querySelector('.eye-hide');

    if (input.type === 'password') {
        input.type = 'text';
        if (showIcon) showIcon.style.display = 'none';
        if (hideIcon) hideIcon.style.display = 'block';
    } else {
        input.type = 'password';
        if (showIcon) showIcon.style.display = 'block';
        if (hideIcon) hideIcon.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Subtle parallax effect on mousemove for desktop
    const bg = document.querySelector('.nature-bg');
    const card = document.querySelector('.paper-card');
    
    if (window.innerWidth > 860 && bg && card) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 12;
            const y = (e.clientY / window.innerHeight - 0.5) * 12;
            bg.style.transform = `scale(1.04) translate(${x * 0.4}px, ${y * 0.4}px)`;
        });
    }
});
