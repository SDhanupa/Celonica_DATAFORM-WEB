<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('password','password-confirm'); section>
    <#if section = "header">
        Set New Password
    <#elseif section = "form">
        <form id="kc-passwd-update-form" action="${url.loginAction}" method="post" class="auth-form">
            <div class="form-instruction-text">
                Please set a new password for your account.
            </div>

            <div class="form-group <#if messagesPerField.existsError('password')>has-error</#if>">
                <label for="password-new" class="input-label">New password</label>
                <div class="input-wrapper password-wrapper">
                    <input type="password" id="password-new" name="password-new" class="pill-input" autofocus
                           autocomplete="new-password"
                           aria-invalid="<#if messagesPerField.existsError('password')>true</#if>"
                           placeholder="Enter new password" />
                    <button type="button" class="eye-toggle-btn" aria-label="Toggle password visibility" onclick="togglePasswordVisibility('password-new', this)">
                        <svg class="eye-icon eye-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <svg class="eye-icon eye-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('password')>
                    <span class="field-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-group <#if messagesPerField.existsError('password-confirm')>has-error</#if>">
                <label for="password-confirm" class="input-label">Confirm password</label>
                <div class="input-wrapper password-wrapper">
                    <input type="password" id="password-confirm" name="password-confirm" class="pill-input"
                           autocomplete="new-password"
                           aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                           placeholder="Confirm new password" />
                    <button type="button" class="eye-toggle-btn" aria-label="Toggle password visibility" onclick="togglePasswordVisibility('password-confirm', this)">
                        <svg class="eye-icon eye-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <svg class="eye-icon eye-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: none;">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                            <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                    </button>
                </div>
                <#if messagesPerField.existsError('password-confirm')>
                    <span class="field-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                    </span>
                </#if>
            </div>

            <div class="form-action">
                <button class="btn-emerald" type="submit">
                    <span>Update Password</span>
                </button>
            </div>
        </form>
    </#if>
</@layout.registrationLayout>
