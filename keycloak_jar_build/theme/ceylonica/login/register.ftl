<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        Sign up
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post" class="auth-form">
            
            <div class="form-row-2col">
                <!-- First Name -->
                <div class="form-group <#if messagesPerField.existsError('firstName')>has-error</#if>">
                    <label for="firstName" class="input-label">First name</label>
                    <div class="input-wrapper">
                        <input type="text" id="firstName" class="pill-input" name="firstName"
                               value="${(register.formData.firstName!'')}"
                               aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                               placeholder="First name" />
                    </div>
                    <#if messagesPerField.existsError('firstName')>
                        <span class="field-error-text" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                        </span>
                    </#if>
                </div>

                <!-- Last Name -->
                <div class="form-group <#if messagesPerField.existsError('lastName')>has-error</#if>">
                    <label for="lastName" class="input-label">Last name</label>
                    <div class="input-wrapper">
                        <input type="text" id="lastName" class="pill-input" name="lastName"
                               value="${(register.formData.lastName!'')}"
                               aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>"
                               placeholder="Last name" />
                    </div>
                    <#if messagesPerField.existsError('lastName')>
                        <span class="field-error-text" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                        </span>
                    </#if>
                </div>
            </div>

            <!-- Email -->
            <div class="form-group <#if messagesPerField.existsError('email')>has-error</#if>">
                <label for="email" class="input-label">Email address</label>
                <div class="input-wrapper">
                    <input type="text" id="email" class="pill-input" name="email"
                           value="${(register.formData.email!'')}" autocomplete="email"
                           aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                           placeholder="name@example.com" />
                </div>
                <#if messagesPerField.existsError('email')>
                    <span class="field-error-text" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('email'))?no_esc}
                    </span>
                </#if>
            </div>

            <#if !realm.registrationEmailAsUsername>
                <!-- Username -->
                <div class="form-group <#if messagesPerField.existsError('username')>has-error</#if>">
                    <label for="username" class="input-label">Username</label>
                    <div class="input-wrapper">
                        <input type="text" id="username" class="pill-input" name="username"
                               value="${(register.formData.username!'')}" autocomplete="username"
                               aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                               placeholder="Choose a username" />
                    </div>
                    <#if messagesPerField.existsError('username')>
                        <span class="field-error-text" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('username'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <#if passwordRequired??>
                <!-- Password -->
                <div class="form-group <#if messagesPerField.existsError('password')>has-error</#if>">
                    <label for="password" class="input-label">Password</label>
                    <div class="input-wrapper password-wrapper">
                        <input type="password" id="password" class="pill-input" name="password"
                               autocomplete="new-password"
                               aria-invalid="<#if messagesPerField.existsError('password')>true</#if>"
                               placeholder="Create strong password" />
                        <button type="button" class="eye-toggle-btn" aria-label="Toggle password visibility" onclick="togglePasswordVisibility('password', this)">
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

                <!-- Confirm Password -->
                <div class="form-group <#if messagesPerField.existsError('password-confirm')>has-error</#if>">
                    <label for="password-confirm" class="input-label">Confirm password</label>
                    <div class="input-wrapper password-wrapper">
                        <input type="password" id="password-confirm" class="pill-input" name="password-confirm"
                               aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                               placeholder="Confirm your password" />
                        <button type="button" class="eye-toggle-btn" aria-label="Toggle password visibility" onclick="togglePasswordVisibility('password-confirm', this)">
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
                    <#if messagesPerField.existsError('password-confirm')>
                        <span class="field-error-text" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <!-- Submit Button -->
            <div class="form-action">
                <button class="btn-emerald" type="submit">
                    <span>Create account</span>
                </button>
            </div>

        </form>
    <#elseif section = "info">
        <div class="auth-aux-links">
            <div class="register-prompt">
                <span>Already have an account?</span>
                <a href="${url.loginUrl}" class="signup-link">Log in</a>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
