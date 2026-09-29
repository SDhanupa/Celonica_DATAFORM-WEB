<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=(realm.password && realm.registrationAllowed && !registrationDisabled??); section>
    <#if section = "header">
        Log in
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <#if realm.password>
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post" class="auth-form">
                        
                        <!-- Username / Email Field -->
                        <div class="form-group <#if messagesPerField.existsError('username')>has-error</#if>">
                            <label for="username" class="input-label">Login, email or phone number</label>
                            <div class="input-wrapper">
                                <input tabindex="1" id="username" class="pill-input" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username"
                                    aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                                    placeholder="Enter your username or email" />
                            </div>
                            <#if messagesPerField.existsError('username')>
                                <span class="field-error-text" aria-live="polite">
                                    ${kcSanitize(messagesPerField.get('username'))?no_esc}
                                </span>
                            </#if>
                        </div>

                        <!-- Password Field -->
                        <div class="form-group <#if messagesPerField.existsError('password')>has-error</#if>">
                            <label for="password" class="input-label">Password</label>
                            <div class="input-wrapper password-wrapper">
                                <input tabindex="2" id="password" class="pill-input" name="password" type="password" autocomplete="current-password"
                                    aria-invalid="<#if messagesPerField.existsError('password')>true</#if>"
                                    placeholder="Enter your password" />
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

                        <!-- Remember Me & Options -->
                        <#if realm.rememberMe && !usernameHidden??>
                            <div class="form-options">
                                <label class="checkbox-label">
                                    <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" <#if login.rememberMe??>checked</#if>>
                                    <span class="custom-checkbox"></span>
                                    <span class="checkbox-text">Remember me</span>
                                </label>
                            </div>
                        </#if>

                        <!-- Submit CTA Button -->
                        <div class="form-action">
                            <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
                            <button tabindex="4" class="btn-emerald" name="login" id="kc-login" type="submit">
                                <span>Log in</span>
                            </button>
                        </div>

                    </form>
                </#if>
            </div>
        </div>
    <#elseif section = "info">
        <div class="auth-aux-links">
            <#if realm.resetPasswordAllowed>
                <div class="forgot-link-box">
                    <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="forgot-password-link">
                        Forgot login or password?
                    </a>
                </div>
            </#if>
            <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
                <div class="register-prompt">
                    <span>Don't have an account?</span>
                    <a tabindex="6" href="${url.registrationUrl}" class="signup-link">Sign up</a>
                </div>
            </#if>
        </div>
    </#if>
</@layout.registrationLayout>
