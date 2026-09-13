<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm','user.attributes.mobile_number','user.attributes.nic'); section>
    <#if section = "header">
        Sign up
    <#elseif section = "form">
        <form id="kc-register-form" action="${url.registrationAction}" method="post" class="auth-form">

            <#-- ════════════════════════════════════════════
                 STEP 2 — OTP verification
                 Shown only when server sets otpPending=true
                 ════════════════════════════════════════════ -->
            <#if otpPending?? && otpPending == "true">

                <#-- Re-submit all registration data transparently as hidden fields -->
                <#if messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm','user.attributes.mobile_number','user.attributes.nic')>
                    <div style="background:red; color:white; padding:10px; margin-bottom:10px;">
                        <strong>DEBUG ERRORS:</strong><br/>
                        <#if messagesPerField.existsError('firstName')>firstName: ${messagesPerField.get('firstName')}<br/></#if>
                        <#if messagesPerField.existsError('lastName')>lastName: ${messagesPerField.get('lastName')}<br/></#if>
                        <#if messagesPerField.existsError('email')>email: ${messagesPerField.get('email')}<br/></#if>
                        <#if messagesPerField.existsError('username')>username: ${messagesPerField.get('username')}<br/></#if>
                        <#if messagesPerField.existsError('password')>password: ${messagesPerField.get('password')}<br/></#if>
                        <#if messagesPerField.existsError('password-confirm')>password-confirm: ${messagesPerField.get('password-confirm')}<br/></#if>
                        <#if messagesPerField.existsError('user.attributes.mobile_number')>mobile: ${messagesPerField.get('user.attributes.mobile_number')}<br/></#if>
                        <#if messagesPerField.existsError('user.attributes.nic')>nic: ${messagesPerField.get('user.attributes.nic')}<br/></#if>
                    </div>
                </#if>
                
                <input type="hidden" name="firstName"                        value="${(savedFirstName!'')}"/>
                <input type="hidden" name="lastName"                         value="${(savedLastName!'')}"/>
                <input type="hidden" name="email"                            value="${(savedEmail!'')}"/>
                <input type="hidden" name="username"                         value="${(savedUsername!'')}"/>
                <input type="hidden" name="user.attributes.nic"              value="${(savedNic!'')}"/>
                <input type="hidden" name="user.attributes.mobile_number"    value="${(savedMobile!'')}"/>
                <#-- Password is injected from the server-side AuthNote -->
                <#if savedPassword??>
                    <input type="hidden" name="password"         value="${savedPassword}"/>
                    <input type="hidden" name="password-confirm" value="${savedPassword}"/>
                </#if>

                <div style="background:#f0fdf4;padding:20px;border-radius:12px;border:1px solid #bbf7d0;">
                    <h3 style="color:#166534;margin:0 0 8px 0;font-size:18px;">Verify Mobile Number</h3>
                    <p style="color:#15803d;font-size:14px;margin:0 0 16px 0;">
                        An 8-digit verification code has been sent to
                        <strong>${(savedMobile!'')}</strong>.
                    </p>

                    <div class="form-group <#if messagesPerField.existsError('otp')>has-error</#if>">
                        <label for="otp" class="input-label">Enter 8-digit OTP</label>
                        <div class="input-wrapper">
                            <input type="text" id="otp" name="otp" class="pill-input" autofocus
                                   maxlength="8" inputmode="numeric"
                                   style="font-size:20px;letter-spacing:4px;text-align:center;border-color:#22c55e;"
                                   placeholder="00000000"/>
                        </div>
                        <#if messagesPerField.existsError('otp')>
                            <#assign otpMsg = messagesPerField.get('otp')>
                            <#if otpMsg != "An 8-digit code has been sent to your mobile.">
                                <span class="field-error-text" aria-live="polite">${kcSanitize(otpMsg)?no_esc}</span>
                            </#if>
                        </#if>
                    </div>
                </div>

                <div class="form-action" style="margin-top:16px;">
                    <button tabindex="1" class="btn-emerald" type="submit">
                        <span>Verify &amp; Create Account</span>
                    </button>
                </div>

            <#-- ════════════════════════════════════════════
                 STEP 1 — Registration fields
                 ════════════════════════════════════════════ -->
            <#else>

                <div class="form-row-2col">
                    <!-- First Name -->
                    <div class="form-group <#if messagesPerField.existsError('firstName')>has-error</#if>">
                        <label for="firstName" class="input-label">First name</label>
                        <div class="input-wrapper">
                            <input type="text" id="firstName" class="pill-input" name="firstName"
                                   value="${(register.formData.firstName!'')}"
                                   aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                                   placeholder="First name"/>
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
                                   placeholder="Last name"/>
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
                               placeholder="name@example.com"/>
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
                                   placeholder="Choose a username"/>
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
                                   placeholder="Create strong password"/>
                            <button type="button" class="eye-toggle-btn" aria-label="Toggle password visibility"
                                    onclick="togglePasswordVisibility('password', this)">
                                <svg class="eye-icon eye-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg class="eye-icon eye-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
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
                                   placeholder="Confirm your password"/>
                            <button type="button" class="eye-toggle-btn" aria-label="Toggle password visibility"
                                    onclick="togglePasswordVisibility('password-confirm', this)">
                                <svg class="eye-icon eye-show" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                                <svg class="eye-icon eye-hide" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
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

                <!-- NIC Number -->
                <div class="form-group <#if messagesPerField.existsError('user.attributes.nic')>has-error</#if>">
                    <label for="nic" class="input-label">NIC Number</label>
                    <div class="input-wrapper">
                        <input type="text" id="nic" class="pill-input" name="user.attributes.nic"
                               value="${(register.formData['user.attributes.nic']!'')}"
                               aria-invalid="<#if messagesPerField.existsError('user.attributes.nic')>true</#if>"
                               placeholder="e.g. 199012345678 or 901234567V"/>
                    </div>
                    <#if messagesPerField.existsError('user.attributes.nic')>
                        <span class="field-error-text" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('user.attributes.nic'))?no_esc}
                        </span>
                    </#if>
                </div>

                <!-- Mobile Number -->
                <div class="form-group <#if messagesPerField.existsError('user.attributes.mobile_number')>has-error</#if>">
                    <label for="mobile_number" class="input-label">Mobile Number</label>
                    <div class="input-wrapper">
                        <input type="text" id="mobile_number" class="pill-input" name="user.attributes.mobile_number"
                               value="${(register.formData['user.attributes.mobile_number']!'')}"
                               aria-invalid="<#if messagesPerField.existsError('user.attributes.mobile_number')>true</#if>"
                               placeholder="e.g. 0712345678"/>
                    </div>
                    <#if messagesPerField.existsError('user.attributes.mobile_number')>
                        <span class="field-error-text" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('user.attributes.mobile_number'))?no_esc}
                        </span>
                    </#if>
                </div>

                <div class="form-action">
                    <button tabindex="4" class="btn-emerald" type="submit">
                        <span>Next</span>
                    </button>
                </div>

            </#if>

        </form>
    <#elseif section = "info">
        <div class="auth-aux-links">
            <div class="register-prompt">
                <span>Already have an account?</span>
                <a tabindex="5" href="${url.loginUrl}" class="signup-link">Log in</a>
            </div>
        </div>
    </#if>
</@layout.registrationLayout>
