<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true; section>
    <#if section = "header">
        Email Verification
    <#elseif section = "form">
        <div class="info-content-box">
            <div class="info-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </div>
            <p class="form-instruction-text">
                An email with instructions to verify your email address has been sent to <strong>${(user.email!'your email')}</strong>.
            </p>
            <div class="form-action" style="margin-top: 24px;">
                <a href="${url.loginAction}" class="btn-emerald" style="text-decoration: none; text-align: center; display: block;">
                    <span>Resend Verification Email</span>
                </a>
            </div>
        </div>
    <#elseif section = "info">
        <div class="auth-aux-links">
            <div class="register-prompt">
                <a href="${url.loginUrl}" class="signup-link">Back to log in</a>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
