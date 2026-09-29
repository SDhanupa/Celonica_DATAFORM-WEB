<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        Reset Password
    <#elseif section = "form">
        <form id="kc-reset-password-form" action="${url.loginAction}" method="post" class="auth-form">
            <div class="form-instruction-text">
                Enter your email address or username and we'll send you instructions to reset your password.
            </div>

            <div class="form-group <#if messagesPerField.existsError('username')>has-error</#if>">
                <label for="username" class="input-label">Username or email</label>
                <div class="input-wrapper">
                    <input type="text" id="username" name="username" class="pill-input" autofocus
                           value="${(auth.attemptedUsername!'')}"
                           aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                           placeholder="Enter your email or username" />
                </div>
                <#if messagesPerField.existsError('username')>
                    <span class="field-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('username'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-action">
                <button class="btn-emerald" type="submit">
                    <span>Send Reset Instructions</span>
                </button>
            </div>
        </form>
    <#elseif section = "info">
        <div class="auth-aux-links">
            <div class="register-prompt">
                <span>Remember your password?</span>
                <a href="${url.loginUrl}" class="signup-link">Back to log in</a>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
