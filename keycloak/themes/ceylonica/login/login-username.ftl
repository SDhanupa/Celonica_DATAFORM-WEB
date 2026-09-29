<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=(realm.password && realm.registrationAllowed && !registrationDisabled??); section>
    <#if section = "header">
        Log in
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <#if realm.password>
                    <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post" class="auth-form">
                        
                        <!-- Username Field -->
                        <div class="form-group <#if messagesPerField.existsError('username')>has-error</#if>">
                            <label for="username" class="input-label">Username (NIC)</label>
                            <div class="input-wrapper">
                                <input tabindex="1" id="username" class="pill-input" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="username"
                                    aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                                    placeholder="Enter your Username or NIC" />
                            </div>
                            <#if messagesPerField.existsError('username')>
                                <span class="field-error-text" aria-live="polite">
                                    User not found, please <a href="${url.registrationUrl}" style="color: var(--primary); text-decoration: underline;">register</a>!
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
                                <span>Next</span>
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
